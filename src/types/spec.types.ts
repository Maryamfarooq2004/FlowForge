// Frontend mirror of the backend WorkflowSpec shape (server/src/types/spec.types.ts).

export type FieldType =
  | 'text' | 'richtext' | 'number' | 'currency' | 'date' | 'time'
  | 'boolean' | 'enum' | 'phone' | 'email' | 'reference';

export interface SpecField {
  name: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  reference?: string;
  unique?: boolean;   // user-declared; never inferred
}

export interface SpecEntity {
  key: string;
  name: string;
  label: string;
  description?: string;
  fields: SpecField[];
  isWorkflowEntity?: boolean;
}

export interface SpecPermission {
  action: string;
  allowed: boolean;
}

export interface SpecRole {
  key: string;
  name: string;
  description?: string;
  permissions: SpecPermission[];
  manuallyAdded?: boolean;
}

export interface SpecState {
  key: string;
  label: string;
  order: number;
  isInitial?: boolean;
  isFinal?: boolean;
}

export interface SpecTransition {
  from: string;
  to: string;
  label: string;
  role?: string;
}

export interface SpecRule {
  text: string;
  category?: string;
}

export interface SpecNotificationTrigger {
  event: string;
  channel: 'email' | 'in-app' | 'both';
  description: string;
}

export type SpecProviderKind = 'gemini' | 'deterministic';

/** A concrete, machine-applicable change a suggestion performs (FE5.9). */
export type SuggestionEffect =
  | { kind: 'addField'; entityKey: string; field: SpecField }
  | { kind: 'addEnumOption'; entityKey: string; fieldName: string; option: string }
  | { kind: 'addRule'; rule: SpecRule }
  | { kind: 'addNotification'; trigger: SpecNotificationTrigger };

export interface SpecSuggestion {
  id: string;
  title: string;
  description: string;
  targetEntity?: string;
  applied: boolean;
  effect?: SuggestionEffect; // absent ⇒ advice-only, no Apply button
}

export interface SpecRisk {
  id: string;
  title: string;
  description: string;
  severity: 'warning' | 'critical';
  resolved: boolean;
}

export interface SpecExplanation {
  subject: string;
  text: string;
}

export interface SpecChecklistItem {
  key: string;
  label: string;
  confirmed: boolean;       // system readiness check
  userConfirmed?: boolean;  // the user's own tick (FE5.10)
}

export type WorkflowSpecStatus = 'draft' | 'validated' | 'approved';

export interface WorkflowSpec {
  id: string;
  projectId: string;
  domain: 'clinic' | 'school';
  version: number;
  status: WorkflowSpecStatus;
  entities: SpecEntity[];
  roles: SpecRole[];
  states: SpecState[];
  transitions: SpecTransition[];
  businessRules: SpecRule[];
  notificationTriggers: SpecNotificationTrigger[];
  suggestions: SpecSuggestion[];
  risks: SpecRisk[];
  explanations: SpecExplanation[];
  checklist: SpecChecklistItem[];
  completionScore: number;
  validationErrors: string[];
  resolvedRiskIds?: string[];
  confirmedChecklistKeys?: string[];
  provider?: SpecProviderKind;
  generatedAt?: string;
  approvedAt?: string;
}
