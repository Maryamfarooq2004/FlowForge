// Frontend mirror of the backend preview DTOs (server/src/types/preview.types.ts).
import type { FieldType } from './spec.types';

export interface PreviewRecord {
  id: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  [attr: string]: any;
}

export interface PreviewFieldMeta {
  specName: string;
  attrName: string;
  fieldType: FieldType;
  required: boolean;
  enumValues?: string[];
  isStatus?: boolean;
  ref?: { targetKey: string; targetLabel: string };
}

export interface PreviewEntityMeta {
  key: string;
  label: string;
  modelName: string;
  routeBase: string;
  isWorkflow: boolean;
  displayFieldAttr: string;
  fields: PreviewFieldMeta[];
}

export interface PreviewRoleMeta {
  key: string;
  name: string;
}

export interface PreviewWorkflowMeta {
  entityKey: string;
  statusAttr: string;
  initialStateKey: string;
  states: Array<{ key: string; label: string; isInitial: boolean; isFinal: boolean }>;
  transitions: Array<{ from: string; to: string; label: string; roleKey?: string }>;
}

export interface PreviewThemeConfig {
  brand: { primary: string; secondary: string; accent: string };
  fonts: { heading: string; body: string };
}

export interface PreviewSpecMeta {
  domain: 'clinic' | 'school';
  appLabel: string;
  entities: PreviewEntityMeta[];
  roles: PreviewRoleMeta[];
  workflow?: PreviewWorkflowMeta;
  theme: PreviewThemeConfig;
}

export interface PreviewState {
  meta: PreviewSpecMeta;
  records: Record<string, PreviewRecord[]>;
  activeRoleKey: string;
}
