/**
 * Shared WorkflowSpec type definitions — the formal blueprint the platform
 * produces from an assembled IntakeBundle. These interfaces are the contract
 * between the SpecProvider (deterministic now, Gemini later), the validator,
 * the WorkflowSpec model, and (mirrored on) the frontend.
 */

export type SpecDomain = 'clinic' | 'school';

export type FieldType =
  | 'text'
  | 'richtext'
  | 'number'
  | 'currency'
  | 'date'
  | 'time'
  | 'boolean'
  | 'enum'
  | 'phone'
  | 'email'
  | 'reference';

export interface SpecField {
  name: string;
  type: FieldType;
  required?: boolean;
  options?: string[];   // for enum
  reference?: string;   // entity name, for reference type
  unique?: boolean;     // user-declared; never inferred (see planning/12 §2)
}

export interface SpecEntity {
  key: string;              // stable id, e.g. "patient"
  name: string;             // singular label, e.g. "Patient"
  label: string;            // collection label, e.g. "Patient Records"
  description?: string;
  fields: SpecField[];
  isWorkflowEntity?: boolean; // true if it carries the workflow status field
}

export interface SpecPermission {
  action: string;
  allowed: boolean;
}

export interface SpecRole {
  key: string;              // e.g. "receptionist"
  name: string;             // e.g. "Receptionist"
  description?: string;
  permissions: SpecPermission[];
  manuallyAdded?: boolean;  // added by the user rather than the template
}

export interface SpecState {
  key: string;              // e.g. "booked"
  label: string;            // e.g. "Appointment Booked"
  order: number;
  isInitial?: boolean;
  isFinal?: boolean;
}

export interface SpecTransition {
  from: string;             // state key
  to: string;               // state key
  label: string;            // e.g. "Confirm"
  role?: string;            // role key allowed to perform it
}

export interface SpecRule {
  text: string;             // plain-language business rule
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
  targetEntity?: string;    // entity key the suggestion applies to
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
  subject: string;          // e.g. "Patient Records"
  text: string;             // plain-language explanation
}

export interface SpecChecklistItem {
  key: string;
  label: string;
  confirmed: boolean;       // system readiness check
  userConfirmed?: boolean;  // the user's own tick (FE5.10)
}

/** The full generated spec payload (independent of persistence concerns). */
export interface WorkflowSpecData {
  domain: SpecDomain;
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
  completionScore: number;  // 0-100
  provider?: SpecProviderKind; // which engine produced this spec
}

/** Minimal view of an assembled IntakeBundle the provider consumes. */
export interface AssembledBundleInput {
  domain: SpecDomain;
  structuredForm: Record<string, any>;
  guidedScreens: Array<{
    step: number;
    title: string;
    content: string;
    items: string[];
  }>;
}
