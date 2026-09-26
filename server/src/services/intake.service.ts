import { IntakeBundle } from '../models/IntakeBundle.model';
import { Project } from '../models/Project.model';
import { IntakeQuestion } from '../models/IntakeQuestion.model';
import { AppError } from '../utils/AppError';
import { mergeUnique } from './document.service';
import { sanitizeIntakeText, sanitizeStringArray } from '../utils/sanitize.utils';
import { detectItemsForScreen, validateIntakeBundle } from './intakeValidation';

const VALID_CATEGORIES = ['clinic', 'school'];

// ── GET QUESTIONS ──────────────────────────────────────────

export const getQuestionsService = async (category: string) => {
  if (!category || !VALID_CATEGORIES.includes(category)) {
    throw new AppError('A valid category (clinic or school) is required.', 400, 'INVALID_CATEGORY');
  }
  // `isActive: { $ne: false }` returns active questions AND legacy docs that
  // predate the field (avoids the strictQuery-masked "empty form" trap).
  return IntakeQuestion.find({ category, isActive: { $ne: false } }).sort({ order: 1 });
};

// Required question ids for a domain (used to gate structured-form completeness).
const getRequiredQuestionIds = async (category: string): Promise<string[]> => {
  const required = await IntakeQuestion.find(
    { category, required: true, isActive: { $ne: false } },
    { id: 1 }
  );
  return required.map((q: any) => q.id);
};

// A form answer counts as "answered" if it's a non-empty string/array/object.
const isAnswered = (v: any): boolean => {
  if (v == null) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.values(v).some(isAnswered);
  return String(v).trim().length > 0;
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

  const safeForm = formData && typeof formData === 'object' ? formData : {};

  // Answer-side validation: completeness is driven by whether every REQUIRED
  // question for this domain has an answer (drafts save fine but stay incomplete).
  const requiredIds = await getRequiredQuestionIds(project.domain);
  const missingRequired = requiredIds.filter((id) => !isAnswered(safeForm[id]));
  const complete = missingRequired.length === 0;

  const bundle = await IntakeBundle.findOneAndUpdate(
    { projectId, userId },
    {
      $set: {
        structuredFormData: safeForm,
        structuredFormComplete: complete,
        updatedAt: new Date(),
      },
    },
    { new: true, upsert: false }
  );

  if (!bundle) throw new AppError('Intake bundle not found.', 404, 'NOT_FOUND');

  // Advance progress only once the form is actually complete.
  if (complete) {
    await Project.findByIdAndUpdate(projectId, {
      'progress.currentPhase': 'guided_story',
      'progress.lastActiveScreen': `/project/${projectId}/intake/story`,
      $addToSet: { 'progress.completedSteps': 'intake_form' },
    });
  }

  return { bundle, complete, missingRequired };
};

// ── SAVE GUIDED SCREEN (called on every Next click) ───────────

export const saveGuidedScreenService = async (
  userId: string,
  projectId: string,
  screenNumber: 1 | 2 | 3 | 4,
  content: string,
  _detectedItems: string[],
  confirmedItems: string[]
) => {
  const cleanContent = sanitizeIntakeText(content);
  if (cleanContent.trim().length < 10) {
    throw new AppError(
      'Please provide more detail before continuing.',
      400,
      'INSUFFICIENT_CONTENT'
    );
  }

  // Need the domain to run deterministic detection.
  const existing = await IntakeBundle.findOne({ projectId, userId });
  if (!existing) throw new AppError('Intake bundle not found.', 404, 'NOT_FOUND');

  // Server-side, authoritative detection (do NOT trust client-sent detectedItems).
  const detected = detectItemsForScreen(screenNumber, cleanContent, existing.domain as any);
  // Keep only confirmed items the client actually derived from detection.
  const cleanConfirmed = sanitizeStringArray(confirmedItems);

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
        [`guidedScreens.${screenNumber - 1}.content`]:        cleanContent,
        [`guidedScreens.${screenNumber - 1}.detectedItems`]:  detected,
        [`guidedScreens.${screenNumber - 1}.confirmedItems`]: cleanConfirmed,
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
  if (![1, 2, 3, 4].includes(screenNumber)) {
    throw new AppError('Screen number must be 1, 2, 3, or 4.', 400, 'INVALID_SCREEN');
  }
  const updated = await IntakeBundle.findOneAndUpdate(
    { projectId, userId },
    {
      $set: {
        [`guidedScreens.${screenNumber - 1}.content`]:  sanitizeIntakeText(content),
        [`guidedScreens.${screenNumber - 1}.savedAt`]:  new Date(),
      },
    },
    { new: true }
  );
  if (!updated) throw new AppError('Intake bundle not found.', 404, 'NOT_FOUND');
  // Do not advance progress on auto-save
};

// ── ASSEMBLE BUNDLE (Final Step) ──────────────────────────────

export const assembleBundleService = async (
  userId: string,
  projectId: string
) => {
  console.log(`[IntakeService] Assembling bundle for project ${projectId} (User: ${userId})`);
  const bundle = await IntakeBundle.findOne({ projectId, userId });
  if (!bundle) {
    console.error(`[IntakeService] Bundle NOT FOUND for project ${projectId}`);
    throw new AppError('Intake bundle not found.', 404, 'NOT_FOUND');
  }

  // ── FE2.11: consistency validation BEFORE extraction ──────────────
  const { errors, warnings } = validateIntakeBundle(bundle);
  bundle.validationErrors = errors;
  bundle.validationWarnings = warnings;

  // Blocking errors → persist them, do NOT assemble or flip to SPEC_READY.
  if (errors.length > 0) {
    await bundle.save();
    return { bundle, valid: false as const, errors, warnings };
  }

  // Passed validation → assemble.
  bundle.isAssembled = true;
  bundle.assembledAt = new Date();

  // Merged document extractions feed the same channel the spec provider reads
  // (guidedScreens[].items): roles → step 2, fields → step 3, rules → step 4.
  const docItems = (bundle.documentItems || { roles: [], fields: [], rules: [] });
  const extraForStep = (step: number): string[] =>
    step === 2 ? docItems.roles : step === 3 ? docItems.fields : step === 4 ? docItems.rules : [];

  const titles = ['Story', 'People', 'Data', 'Rules'];
  const assembled = bundle.guidedScreens.map(s => ({
    step: Number(s.screen),
    title: titles[s.screen - 1],
    content: s.content,
    items: mergeUnique(
      (s.confirmedItems && s.confirmedItems.length > 0) ? s.confirmedItems : (s.detectedItems || []),
      extraForStep(s.screen)
    ),
  }));

  // Don't lose document items when their target guided screen is missing.
  for (const step of [2, 3, 4]) {
    const extra = extraForStep(step);
    if (extra.length && !assembled.some(a => a.step === step)) {
      assembled.push({ step, title: titles[step - 1], content: '', items: mergeUnique([], extra) });
    }
  }
  assembled.sort((a, b) => a.step - b.step);

  // Create a structured representation for the AI to read later
  bundle.assembledBundle = {
    domain: bundle.domain,
    structuredForm: bundle.structuredFormData,
    guidedScreens: assembled,
  };

  await bundle.save();
  console.log(`[IntakeService] Bundle assembled successfully for project ${projectId}`);

  // Update project progress
  await Project.findOneAndUpdate(
    { _id: projectId, userId },
    {
      status: 'SPEC_READY',
      'progress.currentPhase': 'generating',
      'progress.lastActiveScreen': `/project/${projectId}/spec`,
      $addToSet: { 'progress.completedSteps': 'intake_review' }
    }
  );

  return { bundle, valid: true as const, errors: [] as string[], warnings };
};

// ── VALIDATE (pre-check without assembling) ───────────────────────

export const validateIntakeService = async (userId: string, projectId: string) => {
  const bundle = await IntakeBundle.findOne({ projectId, userId });
  if (!bundle) throw new AppError('Intake bundle not found.', 404, 'NOT_FOUND');
  const { errors, warnings } = validateIntakeBundle(bundle);
  bundle.validationErrors = errors;
  bundle.validationWarnings = warnings;
  await bundle.save();
  return { valid: errors.length === 0, errors, warnings };
};
