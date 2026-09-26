import { WorkflowSpec } from '../models/WorkflowSpec.model';
import { Project } from '../models/Project.model';
import { IntakeBundle } from '../models/IntakeBundle.model';
import { AppError } from '../utils/AppError';
import { getSpecProvider } from './spec/specProvider';
import { validateSpec } from './spec/specValidator';
import { notifyProjectOwner } from './notification.service';
import { AssembledBundleInput, SuggestionEffect, WorkflowSpecData } from '../types/spec.types';

const assertProject = async (userId: string, projectId: string) => {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) throw new AppError('Project not found.', 404, 'NOT_FOUND');
  return project;
};

/**
 * Generate (or regenerate) the WorkflowSpec from the assembled IntakeBundle.
 * Deterministic and fast, so it runs synchronously.
 */
export const generateSpecService = async (userId: string, projectId: string) => {
  await assertProject(userId, projectId);

  const bundle = await IntakeBundle.findOne({ projectId, userId });
  if (!bundle || !bundle.isAssembled || !bundle.assembledBundle) {
    throw new AppError('Intake must be completed before generating a blueprint.', 400, 'NOT_ASSEMBLED');
  }

  const provider = getSpecProvider();
  const specData = await provider.generate(bundle.assembledBundle as unknown as AssembledBundleInput);
  const validation = validateSpec(specData);

  const existing = await WorkflowSpec.findOne({ projectId });
  const version = existing ? existing.version + 1 : 1;

  const spec = await WorkflowSpec.findOneAndUpdate(
    { projectId },
    {
      $set: {
        userId,
        domain: specData.domain,
        entities: specData.entities,
        roles: specData.roles,
        states: specData.states,
        transitions: specData.transitions,
        businessRules: specData.businessRules,
        notificationTriggers: specData.notificationTriggers,
        suggestions: specData.suggestions,
        explanations: specData.explanations,
        risks: validation.risks,
        checklist: validation.checklist,
        completionScore: validation.completionScore,
        validationErrors: validation.validationErrors,
        status: 'validated',
        version,
        provider: specData.provider || 'deterministic',
        generatedAt: new Date(),
        // A regenerated blueprint is a new version and must be reviewed afresh.
        resolvedRiskIds: [],
        confirmedChecklistKeys: [],
        approvedAt: undefined,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await Project.findByIdAndUpdate(projectId, {
    'progress.currentPhase': 'blueprint',
    'progress.lastActiveScreen': `/project/${projectId}/spec`,
    $addToSet: { 'progress.completedSteps': 'generating' },
  });

  void notifyProjectOwner(projectId, 'SPEC_READY');
  return spec;
};

export const getSpecService = async (userId: string, projectId: string) => {
  const spec = await WorkflowSpec.findOne({ projectId, userId });
  if (!spec) throw new AppError('Blueprint not generated yet.', 404, 'SPEC_NOT_FOUND');
  return spec;
};

/** Re-validate a mutated plain spec and persist it, preserving the user's review state. */
const persistRevalidated = async (
  userId: string,
  projectId: string,
  data: WorkflowSpecData,
  changed: Record<string, unknown>,
  userState: { resolvedRiskIds?: string[]; confirmedChecklistKeys?: string[] } = {}
) => {
  const validation = validateSpec(data);
  const resolvedRiskIds = userState.resolvedRiskIds || [];
  const confirmedChecklistKeys = userState.confirmedChecklistKeys || [];

  // validateSpec rebuilds risks + checklist from scratch, so the user's own
  // resolutions/ticks live outside those arrays and are re-applied here.
  const risks = validation.risks.map((r) => ({ ...r, resolved: resolvedRiskIds.includes(r.id) }));
  const checklist = validation.checklist.map((c) => ({
    ...c,
    userConfirmed: confirmedChecklistKeys.includes(c.key),
  }));

  const spec = await WorkflowSpec.findOneAndUpdate(
    { projectId, userId },
    {
      $set: {
        ...changed,
        risks,
        checklist,
        resolvedRiskIds,
        confirmedChecklistKeys,
        completionScore: validation.completionScore,
        validationErrors: validation.validationErrors,
        status: 'validated',
        approvedAt: undefined,
      },
    },
    { new: true }
  );
  if (!spec) throw new AppError('Blueprint not found.', 404, 'SPEC_NOT_FOUND');
  return spec;
};

/** The review state a persisted spec doc carries, for re-application after re-validation. */
const userStateOf = (spec: any) => ({
  resolvedRiskIds: (spec.resolvedRiskIds || []) as string[],
  confirmedChecklistKeys: (spec.confirmedChecklistKeys || []) as string[],
});

/** Merge user edits to the editable spec sections, then re-validate. */
export const updateSpecService = async (
  userId: string,
  projectId: string,
  updates: Partial<WorkflowSpecData>
) => {
  const spec = await WorkflowSpec.findOne({ projectId, userId });
  if (!spec) throw new AppError('Blueprint not found.', 404, 'SPEC_NOT_FOUND');
  const data = spec.toObject() as unknown as WorkflowSpecData;

  const editableKeys: (keyof WorkflowSpecData)[] = [
    'entities', 'roles', 'states', 'transitions', 'businessRules', 'notificationTriggers',
  ];
  const changed: Record<string, unknown> = {};
  for (const key of editableKeys) {
    if (updates[key] !== undefined) {
      (data as any)[key] = updates[key];
      changed[key] = updates[key];
    }
  }
  return persistRevalidated(userId, projectId, data, changed, userStateOf(spec));
};

const sameText = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Apply a suggestion's concrete change to the spec, in place. No-ops when it cannot apply. */
export const applyEffect = (data: WorkflowSpecData, effect: SuggestionEffect): void => {
  switch (effect.kind) {
    case 'addField': {
      const entity = data.entities.find((e) => e.key === effect.entityKey);
      if (!entity) return;
      if (entity.fields.some((f) => sameText(f.name, effect.field.name))) return;
      entity.fields.push({ ...effect.field });
      return;
    }
    case 'addEnumOption': {
      const field = data.entities
        .find((e) => e.key === effect.entityKey)
        ?.fields.find((f) => sameText(f.name, effect.fieldName));
      if (!field) return;
      field.options = field.options || [];
      if (field.options.includes(effect.option)) return;
      // Insert before the last option so terminal choices (Cancelled/Rejected) stay last.
      field.options.splice(Math.max(field.options.length - 1, 0), 0, effect.option);
      return;
    }
    case 'addRule': {
      if (data.businessRules.some((r) => sameText(r.text, effect.rule.text))) return;
      data.businessRules.push({ ...effect.rule });
      return;
    }
    case 'addNotification': {
      if (data.notificationTriggers.some((n) => sameText(n.event, effect.trigger.event))) return;
      data.notificationTriggers.push({ ...effect.trigger });
      return;
    }
  }
};

/** Undo an applied effect, in place. */
export const revertEffect = (data: WorkflowSpecData, effect: SuggestionEffect): void => {
  switch (effect.kind) {
    case 'addField': {
      const entity = data.entities.find((e) => e.key === effect.entityKey);
      if (!entity) return;
      entity.fields = entity.fields.filter((f) => !sameText(f.name, effect.field.name));
      return;
    }
    case 'addEnumOption': {
      const field = data.entities
        .find((e) => e.key === effect.entityKey)
        ?.fields.find((f) => sameText(f.name, effect.fieldName));
      if (!field?.options) return;
      field.options = field.options.filter((o) => o !== effect.option);
      return;
    }
    case 'addRule': {
      data.businessRules = data.businessRules.filter((r) => !sameText(r.text, effect.rule.text));
      return;
    }
    case 'addNotification': {
      data.notificationTriggers = data.notificationTriggers.filter(
        (n) => !sameText(n.event, effect.trigger.event)
      );
      return;
    }
  }
};

export const applySuggestionService = async (
  userId: string,
  projectId: string,
  suggestionId: string,
  applied: boolean
) => {
  const spec = await WorkflowSpec.findOne({ projectId, userId });
  if (!spec) throw new AppError('Blueprint not found.', 404, 'SPEC_NOT_FOUND');
  const data = spec.toObject() as unknown as WorkflowSpecData;

  const suggestion = data.suggestions.find((s) => s.id === suggestionId);
  if (!suggestion) throw new AppError('Suggestion not found.', 404, 'SUGGESTION_NOT_FOUND');

  suggestion.applied = applied;
  if (suggestion.effect) {
    if (applied) applyEffect(data, suggestion.effect);
    else revertEffect(data, suggestion.effect);
  }

  return persistRevalidated(
    userId,
    projectId,
    data,
    {
      suggestions: data.suggestions,
      entities: data.entities,
      businessRules: data.businessRules,
      notificationTriggers: data.notificationTriggers,
    },
    userStateOf(spec)
  );
};

/** Mark a risk reviewed/unreviewed (FE5.8). Soft — never blocks approval. */
export const resolveRiskService = async (
  userId: string,
  projectId: string,
  riskId: string,
  resolved: boolean
) => {
  const spec = await WorkflowSpec.findOne({ projectId, userId });
  if (!spec) throw new AppError('Blueprint not found.', 404, 'SPEC_NOT_FOUND');
  const data = spec.toObject() as unknown as WorkflowSpecData;

  const current = userStateOf(spec).resolvedRiskIds;
  const resolvedRiskIds = resolved
    ? Array.from(new Set([...current, riskId]))
    : current.filter((id) => id !== riskId);

  return persistRevalidated(userId, projectId, data, {}, {
    ...userStateOf(spec),
    resolvedRiskIds,
  });
};

/** Tick/untick one approval-checklist item (FE5.10). */
export const confirmChecklistService = async (
  userId: string,
  projectId: string,
  key: string,
  confirmed: boolean
) => {
  const spec = await WorkflowSpec.findOne({ projectId, userId });
  if (!spec) throw new AppError('Blueprint not found.', 404, 'SPEC_NOT_FOUND');
  const data = spec.toObject() as unknown as WorkflowSpecData;

  const current = userStateOf(spec).confirmedChecklistKeys;
  const confirmedChecklistKeys = confirmed
    ? Array.from(new Set([...current, key]))
    : current.filter((k) => k !== key);

  return persistRevalidated(userId, projectId, data, {}, {
    ...userStateOf(spec),
    confirmedChecklistKeys,
  });
};

/** Approve the spec: blocks on validation errors, freezes it, advances the project. */
export const approveSpecService = async (userId: string, projectId: string) => {
  const spec = await WorkflowSpec.findOne({ projectId, userId });
  if (!spec) throw new AppError('Blueprint not found.', 404, 'SPEC_NOT_FOUND');

  const data = spec.toObject() as unknown as WorkflowSpecData;
  const validation = validateSpec(data);
  if (validation.validationErrors.length > 0) {
    throw new AppError(
      `Cannot approve — please resolve: ${validation.validationErrors.join(' ')}`,
      400,
      'SPEC_INVALID'
    );
  }

  // FE5.10 — the user must confirm every checklist item before approving.
  // Uses the freshly validated checklist, not the stored copy, so it can never go stale.
  const confirmedKeys = userStateOf(spec).confirmedChecklistKeys;
  const unconfirmed = validation.checklist.filter((c) => !confirmedKeys.includes(c.key));
  if (unconfirmed.length > 0) {
    throw new AppError(
      `Please confirm every checklist item before approving: ${unconfirmed
        .map((c) => c.label)
        .join(', ')}.`,
      400,
      'CHECKLIST_INCOMPLETE'
    );
  }

  const approved = await WorkflowSpec.findOneAndUpdate(
    { projectId, userId },
    { $set: { status: 'approved', approvedAt: new Date() } },
    { new: true }
  );

  await Project.findByIdAndUpdate(projectId, {
    'progress.currentPhase': 'alerts',
    'progress.lastActiveScreen': `/project/${projectId}/alerts`,
    $addToSet: { 'progress.completedSteps': 'blueprint' },
  });

  void notifyProjectOwner(projectId, 'SPEC_APPROVED');
  return approved;
};
