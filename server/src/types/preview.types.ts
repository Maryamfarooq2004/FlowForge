import { FieldType } from './spec.types';
import { PreviewRecord } from '../models/PreviewSandbox.model';

/**
 * The clean DTO the live-preview renderer consumes — a projection of the
 * generator IR with the code-generation-specific fields (sqlType, sequelize,
 * validators, FK column names) stripped out.
 */

export interface PreviewFieldMeta {
  specName: string; // human label, e.g. 'Follow-up Date'
  attrName: string; // camelCase key used in records, e.g. 'followUpDate'
  fieldType: FieldType;
  required: boolean;
  enumValues?: string[];
  isStatus?: boolean; // the workflow status field — never rendered as an input
  ref?: { targetKey: string; targetLabel: string };
}

export interface PreviewEntityMeta {
  key: string;
  label: string;
  modelName: string;
  routeBase: string;
  isWorkflow: boolean;
  displayFieldAttr: string; // the attr used to label a row (e.g. in reference selects)
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

/** The full state the API returns on every preview call. */
export interface PreviewState {
  meta: PreviewSpecMeta;
  records: Record<string, PreviewRecord[]>;
  activeRoleKey: string;
}

/** Default theme (brand palette) until per-project ThemeConfig arrives in Phase 7. */
export const DEFAULT_THEME: PreviewThemeConfig = {
  brand: { primary: '#0F766E', secondary: '#4F46E5', accent: '#34D399' },
  fonts: { heading: 'Poppins', body: 'Inter' },
};
