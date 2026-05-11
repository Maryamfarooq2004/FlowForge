import { Project, IProject } from '../models/Project.model';
import { AppError } from '../utils/AppError';

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

export const createProjectService = async (
  userId: string,
  name: string,
  domain: 'clinic' | 'school'
) => {
  try {
    const project = await Project.create({ name, domain, userId });
    return project;
  } catch (err: any) {
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

export const getProjectService = async (userId: string, projectId: string) => {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) throw new AppError('Project not found.', 404, 'NOT_FOUND');
  return project;
};

export const updateProjectService = async (
  userId: string,
  projectId: string,
  data: Partial<IProject>
) => {
  const project = await Project.findOneAndUpdate(
    { _id: projectId, userId },
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!project) throw new AppError('Project not found.', 404, 'NOT_FOUND');
  return project;
};

export const deleteProjectService = async (userId: string, projectId: string) => {
  const result = await Project.findOneAndDelete({ _id: projectId, userId });
  if (!result) throw new AppError('Project not found.', 404, 'NOT_FOUND');
};

export const duplicateProjectService = async (userId: string, projectId: string) => {
  const original = await Project.findOne({ _id: projectId, userId });
  if (!original) throw new AppError('Project not found.', 404, 'NOT_FOUND');

  const copy = await Project.create({
    name: `${original.name} — Copy`,
    domain: original.domain,
    userId,
    status: 'INTAKE',
  });
  return copy;
};

export const archiveProjectService = async (userId: string, projectId: string) => {
  return updateProjectService(userId, projectId, { isArchived: true } as any);
};

export const getArchivedProjectsService = async (userId: string) => {
  return Project.find({ userId, isArchived: true }).sort({ updatedAt: -1 });
};
