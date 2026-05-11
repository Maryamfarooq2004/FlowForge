import { IntakeBundle } from '../models/IntakeBundle.model';
import { Project } from '../models/Project.model';
import { IntakeQuestion } from '../models/IntakeQuestion.model';
import { AppError } from '../utils/AppError';

// ── GET QUESTIONS ──────────────────────────────────────────

export const getQuestionsService = async (category: string) => {
  return IntakeQuestion.find({ category, isActive: true }).sort({ order: 1 });
};

// ── GET INTAKE BUNDLE (to prefill forms on resume) ────────────

export const getIntakeBundleService = async (
  userId: string,
  projectId: string
) => {
  const bundle = await IntakeBundle.findOne({ projectId, userId });
  if (!bundle) throw new AppError('Intake data not found.', 404, 'NOT_FOUND');
  return bundle;
};

// ── SAVE STRUCTURED FORM DATA (Step 1 — close-ended form) ────

export const saveStructuredFormService = async (
  userId: string,
  projectId: string,
  formData: Record<string, any>
) => {
  // Verify ownership
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) throw new AppError('Project not found.', 404, 'NOT_FOUND');

  const bundle = await IntakeBundle.findOneAndUpdate(
    { projectId, userId },
    {
      $set: {
        structuredFormData: formData,
        structuredFormComplete: true,
        updatedAt: new Date(),
      },
    },
    { new: true, upsert: false }
  );

  if (!bundle) throw new AppError('Intake bundle not found.', 404, 'NOT_FOUND');

  // Update project progress
  await Project.findByIdAndUpdate(projectId, {
    'progress.currentPhase': 'guided_story',
    'progress.lastActiveScreen': `/project/${projectId}/intake/story`,
    $addToSet: { 'progress.completedSteps': 'intake_form' },
  });

  return bundle;
};

// ── SAVE GUIDED SCREEN (called on every Next click) ───────────

export const saveGuidedScreenService = async (
  userId: string,
  projectId: string,
  screenNumber: 1 | 2 | 3 | 4,
  content: string,
  detectedItems: string[],
  confirmedItems: string[]
) => {
  if (!content || content.trim().length < 10) {
    throw new AppError(
      'Please provide more detail before continuing.',
      400,
      'INSUFFICIENT_CONTENT'
    );
  }

  // Map screen number to phase name
  const screenPhaseMap: Record<number, string> = {
    1: 'guided_story',
    2: 'guided_roles',
    3: 'guided_data',
    4: 'guided_rules',
  };

  const nextPhaseMap: Record<number, string> = {
    1: 'guided_roles',
    2: 'guided_data',
    3: 'guided_rules',
    4: 'intake_review',
  };

  const nextScreenRouteMap: Record<number, string> = {
    1: `/project/${projectId}/intake/roles`,
    2: `/project/${projectId}/intake/data`,
    3: `/project/${projectId}/intake/rules`,
    4: `/project/${projectId}/intake/review`,
  };

  // Update the specific screen in the guidedScreens array
  const bundle = await IntakeBundle.findOneAndUpdate(
    { projectId, userId },
    {
      $set: {
        [`guidedScreens.${screenNumber - 1}.content`]:        content.trim(),
        [`guidedScreens.${screenNumber - 1}.detectedItems`]:  detectedItems,
        [`guidedScreens.${screenNumber - 1}.confirmedItems`]: confirmedItems,
        [`guidedScreens.${screenNumber - 1}.isComplete`]:     true,
        [`guidedScreens.${screenNumber - 1}.savedAt`]:        new Date(),
      },
    },
    { new: true }
  );

  if (!bundle) throw new AppError('Intake bundle not found.', 404, 'NOT_FOUND');

  // Advance project progress to next phase
  await Project.findOneAndUpdate(
    { _id: projectId, userId },
    {
      'progress.currentPhase':     nextPhaseMap[screenNumber],
      'progress.lastActiveScreen': nextScreenRouteMap[screenNumber],
      $addToSet: {
        'progress.completedSteps': screenPhaseMap[screenNumber],
      },
    }
  );

  return bundle;
};

// ── AUTO-SAVE (called every 60 seconds without advancing) ─────

export const autoSaveGuidedScreenService = async (
  userId: string,
  projectId: string,
  screenNumber: 1 | 2 | 3 | 4,
  content: string
) => {
  await IntakeBundle.findOneAndUpdate(
    { projectId, userId },
    {
      $set: {
        [`guidedScreens.${screenNumber - 1}.content`]:  content,
        [`guidedScreens.${screenNumber - 1}.savedAt`]:  new Date(),
      },
    }
  );
  // Do not advance progress on auto-save
};
