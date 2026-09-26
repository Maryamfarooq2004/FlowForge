import { FieldType, SpecRule } from '../types/spec.types';

/**
 * Generation-subsystem internal types: the read-only Intermediate
 * Representation (IR) that every stage consumes, plus the FileArtifact shape
 * every stage emits.
 *
 * The IR is computed ONCE by buildIR() before any stage runs. Because all
 * stages derive identifiers/types/FKs from this single source, schema.sql,
 * the Sequelize models, and the migrations can never drift apart.
 */

/** A single emitted file. `path` is workspace-relative with forward slashes. */
export interface FileArtifact {
  path: string;
  contents: string;
}

export interface StageLog {
  level: 'info' | 'success' | 'warning';
  message: string;
}

/** What each pipeline stage returns: the files it emitted + log lines. */
export interface StageResult {
  artifacts: FileArtifact[];
  logs: StageLog[];
}

/** SQL + Sequelize + validation projection of one field type. */
export interface FieldTypeMapping {
  sqlType: string; // e.g. 'VARCHAR(255)', 'NUMERIC(12,2)'
  sequelizeType: string; // e.g. 'DataTypes.STRING', 'DataTypes.DATEONLY'
  /** express-validator chain fragment applied after the field name, e.g. ".isEmail()". */
  validator: string;
}

export interface FieldReferenceIR {
  targetKey: string;
  targetModel: string; // PascalCase model name of the referenced entity
  targetTable: string; // snake_case plural table of the referenced entity
  fkColumn: string; // snake_case, e.g. 'patient_id'
  fkAttr: string; // camelCase, e.g. 'patientId'
  belongsToAlias: string; // camelCase, e.g. 'patient'
  hasManyAlias: string; // camelCase plural on the target, e.g. 'appointments'
}

export interface FieldIR {
  specName: string; // original human name, e.g. 'Follow-up Date'
  columnName: string; // snake_case, deduped, e.g. 'follow_up_date'
  attrName: string; // camelCase, e.g. 'followUpDate'
  fieldType: FieldType;
  required: boolean;
  sqlType: string; // column type only (CHECK handled separately)
  sqlCheck?: string; // e.g. `"status" IN ('a','b')`
  sequelizeType: string;
  allowNull: boolean;
  defaultValue?: string; // raw JS literal for the model, e.g. "'booked'"
  validator: string; // full express-validator chain, e.g. "body('email').isEmail()"
  enumValues?: string[];
  ref?: FieldReferenceIR;
  isStatus?: boolean; // the workflow status column
  unique?: boolean; // user-declared on the spec field; never inferred
}

export interface EntityIR {
  key: string;
  specIndex: number;
  modelName: string; // PascalCase, e.g. 'FeePlan'
  tableName: string; // snake_case plural, e.g. 'fee_plans'
  routeBase: string; // kebab plural, e.g. 'fee-plans'
  varName: string; // camelCase singular, e.g. 'feePlan'
  label: string;
  description?: string;
  isWorkflow: boolean;
  fields: FieldIR[];
}

export interface WorkflowStateIR {
  key: string;
  label: string;
  isInitial: boolean;
  isFinal: boolean;
}

export interface WorkflowTransitionIR {
  from: string;
  to: string;
  label: string;
  roleKey?: string;
}

export interface WorkflowIR {
  entityKey: string;
  entityModel: string;
  entityRouteBase: string;
  statusColumn: string; // 'status'
  statusAttr: string; // 'status'
  states: WorkflowStateIR[];
  stateKeys: string[];
  initialStateKey: string;
  transitions: WorkflowTransitionIR[];
}

export interface RoleIR {
  key: string;
  name: string;
  description?: string;
  permissions: Array<{ action: string; allowed: boolean }>;
}

/** A configured generated-app alert (from the WorkflowSpec / NotificationConfig). */
export interface NotificationTriggerIR {
  event: string;
  channel: string; // 'email' | 'in-app' | 'both'
  description?: string;
  enabled: boolean;
}

/** Brand theme (colors + fonts) applied to the generated frontend. */
export interface ThemeIR {
  colors: { primary: string; secondary: string; accent: string };
  fonts: { heading: string; body: string };
}

/** The full, read-only IR consumed by every stage. */
export interface IR {
  appName: string; // safe package name, e.g. 'flowforge-clinic-app'
  domain: 'clinic' | 'school';
  entities: EntityIR[]; // TOPOLOGICAL order (referenced tables first)
  entityByKey: Record<string, EntityIR>;
  roles: RoleIR[];
  roleKeys: string[];
  permissionMatrix: Record<string, Record<string, boolean>>;
  workflow?: WorkflowIR;
  rules: SpecRule[];
  notificationTriggers: NotificationTriggerIR[];
  theme: ThemeIR;
}
