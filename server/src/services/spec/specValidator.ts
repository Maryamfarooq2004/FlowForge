import {
  WorkflowSpecData,
  SpecRisk,
  SpecChecklistItem,
} from '../../types/spec.types';

export interface ValidationResult {
  validationErrors: string[];
  risks: SpecRisk[];
  checklist: SpecChecklistItem[];
  completionScore: number;
}

/**
 * Validate a structural spec: required sections, referential integrity, and
 * produce soft risks, the 5-item approval checklist, and a completion score.
 * Pure function — does not mutate the input.
 */
export const validateSpec = (spec: WorkflowSpecData): ValidationResult => {
  const validationErrors: string[] = [];
  const risks: SpecRisk[] = [];

  // ── Required sections (SDD thresholds) ──
  if (spec.entities.length < 1) validationErrors.push('At least one data collection is required.');
  if (spec.roles.length < 2) validationErrors.push('At least two roles are required.');
  if (spec.states.length < 2) validationErrors.push('At least two workflow stages are required.');
  if (spec.businessRules.length < 1) validationErrors.push('At least one business rule is required.');

  // ── Referential integrity ──
  const entityKeys = new Set(spec.entities.map((e) => e.key));
  for (const entity of spec.entities) {
    for (const field of entity.fields) {
      if (field.type === 'reference' && field.reference && !entityKeys.has(field.reference)) {
        validationErrors.push(
          `Field "${field.name}" in "${entity.label}" references a missing collection "${field.reference}".`
        );
      }
    }
  }
  const stateKeys = new Set(spec.states.map((s) => s.key));
  for (const t of spec.transitions) {
    if (!stateKeys.has(t.from) || !stateKeys.has(t.to)) {
      validationErrors.push(`Transition "${t.label}" references a missing workflow stage.`);
    }
  }

  // ── Duplicate keys ──
  const flagDuplicates = (keys: string[], what: string) => {
    const seen = new Set<string>();
    for (const key of keys) {
      if (seen.has(key)) validationErrors.push(`Duplicate ${what} "${key}" — each must be unique.`);
      seen.add(key);
    }
  };
  flagDuplicates(spec.entities.map((e) => e.key), 'data collection');
  flagDuplicates(spec.roles.map((r) => r.key), 'role');
  flagDuplicates(spec.states.map((s) => s.key), 'workflow stage');

  // ── Transition → role references ──
  const roleKeys = new Set(spec.roles.map((r) => r.key));
  for (const t of spec.transitions) {
    if (t.role && !roleKeys.has(t.role)) {
      validationErrors.push(`Transition "${t.label}" is assigned to a missing role "${t.role}".`);
    }
  }

  // ── Workflow collection must exist ──
  if (spec.entities.length > 0 && !spec.entities.some((e) => e.isWorkflowEntity)) {
    validationErrors.push('No data collection is marked as the workflow collection.');
  }

  // ── Exactly one starting stage ──
  const initialStates = spec.states.filter((s) => s.isInitial);
  if (spec.states.length > 0 && initialStates.length !== 1) {
    validationErrors.push(
      initialStates.length === 0
        ? 'One workflow stage must be marked as the starting stage.'
        : 'Only one workflow stage can be the starting stage.'
    );
  }

  // ── Choice fields need real options ──
  for (const entity of spec.entities) {
    for (const field of entity.fields) {
      if (field.type === 'enum' && (field.options || []).length < 2) {
        validationErrors.push(
          `Choice field "${field.name}" in "${entity.label}" needs at least two options.`
        );
      }
    }
  }

  // ── Business rules need text ──
  if (spec.businessRules.some((r) => !r.text || !r.text.trim())) {
    validationErrors.push('Every business rule needs text.');
  }

  // ── Soft risks / gap highlights ──
  const workflowEntities = spec.entities.filter((e) => e.isWorkflowEntity);
  for (const e of workflowEntities) {
    const hasStatus = e.fields.some((f) => f.name.toLowerCase() === 'status');
    if (!hasStatus) {
      risks.push({
        id: `risk-status-${e.key}`,
        title: `"${e.label}" has no Status field`,
        description: `Without a Status field you can't track where each ${e.name.toLowerCase()} is in the workflow. We recommend adding one.`,
        severity: 'warning',
        resolved: false,
      });
    }
  }
  const hasPaymentEntity = spec.entities.some((e) => /pay|fee/i.test(e.key) || /pay|fee/i.test(e.name));
  if (!hasPaymentEntity) {
    risks.push({
      id: 'risk-no-payments',
      title: 'No payments are tracked',
      description: 'Your workflow does not record any payments or fees. Add a payments collection if you handle money.',
      severity: 'warning',
      resolved: false,
    });
  }
  if (spec.states.length > 0 && !spec.states.some((s) => s.isFinal)) {
    risks.push({
      id: 'risk-no-final-state',
      title: 'No end stage',
      description:
        'No workflow stage is marked as the end. Without one you cannot tell which work is finished.',
      severity: 'warning',
      resolved: false,
    });
  }
  if (spec.notificationTriggers.length === 0) {
    risks.push({
      id: 'risk-no-alerts',
      title: 'No alerts configured',
      description: 'No notifications are set up. Consider adding reminders for deadlines or follow-ups.',
      severity: 'warning',
      resolved: false,
    });
  }

  // ── Approval checklist (5 items) ──
  const suggestionsResolved = spec.suggestions.length === 0 || spec.suggestions.every((s) => s.applied);
  const checklist: SpecChecklistItem[] = [
    { key: 'records', label: 'Records', confirmed: spec.entities.length >= 1 },
    {
      key: 'workflow',
      label: 'Workflow',
      confirmed: spec.states.length >= 2 && spec.transitions.length >= 1,
    },
    { key: 'roles', label: 'Roles', confirmed: spec.roles.length >= 2 },
    { key: 'alerts', label: 'Alerts', confirmed: spec.notificationTriggers.length >= 1 },
    { key: 'suggestions', label: 'Confirm all suggestions', confirmed: suggestionsResolved },
  ];

  const confirmedCount = checklist.filter((c) => c.confirmed).length;
  const completionScore = Math.round((confirmedCount / checklist.length) * 100);

  return { validationErrors, risks, checklist, completionScore };
};
