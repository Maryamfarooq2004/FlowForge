import { Project, IProject, ProjectStatus } from '../models/Project.model';
import { IntakeBundle } from '../models/IntakeBundle.model';
import { AppError } from '../utils/AppError';

// ── GET ALL PROJECTS (real data for logged-in user only) ─────

export const getProjectsService = async (
  userId: string,
  filters: { status?: string; domain?: string; page?: number; limit?: number }
) => {
  const { status, domain, page = 1, limit = 20 } = filters;
  const query: any = { userId, isArchived: false };
  if (status) query.status = status;
  if (domain) query.domain = domain;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Project.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    Project.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

// ── CHECK IF USER IS FIRST TIME (no projects at all) ─────────

export const isFirstTimeUserService = async (userId: string): Promise<boolean> => {
  const count = await Project.countDocuments({ userId, isArchived: false });
  return count === 0;
};

// ── GET SINGLE PROJECT WITH FULL PROGRESS ────────────────────

export const getProjectService = async (userId: string, projectId: string) => {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) throw new AppError('Project not found.', 404, 'NOT_FOUND');
  return project;
};

// ── CREATE PROJECT (saves to MongoDB, returns real _id) ───────

export const createProjectService = async (
  userId: string,
  name: string,
  domain: 'clinic' | 'school'
) => {
  try {
    const project = await Project.create({
      name: name.trim(),
      domain,
      userId,
      status: 'INTAKE',
      progress: {
        currentPhase: 'intake_form',
        lastActiveScreen: `/project/TEMP/intake/form`,
        completedSteps: [],
      },
    });
    console.log(`[ProjectService] SUCCESS: Created Project document: ${project._id}`);

    // Create empty IntakeBundle for this project immediately
    try {
      const intake = await IntakeBundle.create({
        projectId: project._id,
        userId,
        domain,
        structuredFormData: {},
        guidedScreens: [
          { screen: 1, content: '', detectedItems: [], confirmedItems: [], isComplete: false, savedAt: new Date() },
          { screen: 2, content: '', detectedItems: [], confirmedItems: [], isComplete: false, savedAt: new Date() },
          { screen: 3, content: '', detectedItems: [], confirmedItems: [], isComplete: false, savedAt: new Date() },
          { screen: 4, content: '', detectedItems: [], confirmedItems: [], isComplete: false, savedAt: new Date() },
        ],
      });
      console.log(`[ProjectService] SUCCESS: Created IntakeBundle document: ${intake._id}`);
    } catch (err: any) {
      console.error(`[ProjectService] ERROR: Failed to create IntakeBundle for project ${project._id}:`, err);
      // Cleanup the project if bundle creation fails to maintain consistency
      await Project.findByIdAndDelete(project._id);
      throw new AppError('Failed to initialize project data. Please try again.', 500, 'INITIALIZATION_FAILED');
    }

    // Update progress with real project ID
    project.progress.lastActiveScreen = `/project/${project._id}/intake/form`;
    await project.save();
    console.log(`[ProjectService] SUCCESS: Finalized project ${project._id} with real lastActiveScreen.`);

    return project;
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    console.error(`[ProjectService] ERROR: Failed to create Project document:`, err);
    if (err.code === 11000) {
      throw new AppError(
        'You already have a project with this name.',
        409,
        'DUPLICATE_NAME'
      );
    }
    throw err;
  }
};

// ── UPDATE PROJECT PROGRESS (called on every Next click) ──────

export const updateProjectProgressService = async (
  userId: string,
  projectId: string,
  phase: string,
  lastActiveScreen: string,
  completedStep?: string
) => {
  const update: any = {
    'progress.currentPhase': phase,
    'progress.lastActiveScreen': lastActiveScreen,
    updatedAt: new Date(),
  };

  const updateOp: any = { $set: update };
  if (completedStep) {
    updateOp['$addToSet'] = { 'progress.completedSteps': completedStep };
  }

  const project = await Project.findOneAndUpdate(
    { _id: projectId, userId },
    updateOp,
    { new: true }
  );

  if (!project) throw new AppError('Project not found.', 404, 'NOT_FOUND');
  return project;
};

// ── GET RESUME POINT (returns exact route to navigate to) ────

export const getResumePointService = async (
  userId: string,
  projectId: string
): Promise<{ route: string; phase: string; project: IProject }> => {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) throw new AppError('Project not found.', 404, 'NOT_FOUND');

  const phaseRouteMap: Record<string, string> = {
    intake_form:   `/project/${projectId}/intake/form`,
    guided_story:  `/project/${projectId}/intake/story`,
    guided_roles:  `/project/${projectId}/intake/roles`,
    guided_data:   `/project/${projectId}/intake/data`,
    guided_rules:  `/project/${projectId}/intake/rules`,
    intake_review: `/project/${projectId}/intake/review`,
    documents:     `/project/${projectId}/documents`,
    theme:         `/project/${projectId}/theme`,
    blueprint:     `/project/${projectId}/spec`,
    generating:    `/project/${projectId}/spec`,
    alerts:        `/project/${projectId}/alerts`,
    preview:       `/project/${projectId}/preview`,
    deployment:    `/project/${projectId}/deploy`,
  };

  const route =
    phaseRouteMap[project.progress.currentPhase] ||
    `/project/${projectId}/intake/form`;

  return { route, phase: project.progress.currentPhase, project };
};

// ── ARCHIVE / DUPLICATE / DELETE ─────────────────────────────

export const archiveProjectService = async (userId: string, projectId: string) => {
  const project = await Project.findOneAndUpdate(
    { _id: projectId, userId },
    { $set: { isArchived: true } },
    { new: true }
  );
  if (!project) throw new AppError('Project not found.', 404, 'NOT_FOUND');
  return project;
};

export const duplicateProjectService = async (userId: string, projectId: string) => {
  const original = await Project.findOne({ _id: projectId, userId });
  if (!original) throw new AppError('Project not found.', 404, 'NOT_FOUND');

  const copy = await Project.create({
    name: `${original.name} — Copy`,
    domain: original.domain,
    userId,
    status: 'INTAKE',
    progress: {
      currentPhase: 'intake_form',
      lastActiveScreen: '',
      completedSteps: [],
    },
  });

  // Create fresh empty IntakeBundle for duplicate
  await IntakeBundle.create({
    projectId: copy._id,
    userId,
    domain: copy.domain,
    structuredFormData: {},
    guidedScreens: [1, 2, 3, 4].map(screen => ({
      screen, content: '', detectedItems: [],
      confirmedItems: [], isComplete: false, savedAt: new Date()
    })),
  });

  return copy;
};

export const deleteProjectService = async (userId: string, projectId: string) => {
  const project = await Project.findOneAndDelete({ _id: projectId, userId });
  if (!project) throw new AppError('Project not found.', 404, 'NOT_FOUND');
  // Clean up intake bundle
  await IntakeBundle.deleteOne({ projectId });
};

// ── GET ARCHIVED PROJECTS ─────────────────────────────────────

export const getArchivedProjectsService = async (userId: string) => {
  return Project.find({ userId, isArchived: true }).sort({ updatedAt: -1 });
};
