import type {
  PreviewEntityMeta,
  PreviewFieldMeta,
  PreviewRecord,
  PreviewSpecMeta,
  PreviewWorkflowMeta,
} from '../../../types/preview.types';

/** A human label for a record (its display field, else a short id). */
export const recordLabel = (entity: PreviewEntityMeta, record: PreviewRecord): string => {
  const v = record[entity.displayFieldAttr];
  return v !== undefined && v !== null && v !== '' ? String(v) : `#${record.id.slice(0, 6)}`;
};

/** Format one field value for read-only display, resolving references to labels. */
export const formatValue = (
  field: PreviewFieldMeta,
  value: any,
  meta: PreviewSpecMeta,
  records: Record<string, PreviewRecord[]>
): string => {
  if (value === undefined || value === null || value === '') return '—';
  if (field.ref) {
    const target = meta.entities.find((e) => e.key === field.ref!.targetKey);
    const row = (records[field.ref.targetKey] ?? []).find((r) => r.id === value);
    return target && row ? recordLabel(target, row) : String(value);
  }
  if (field.fieldType === 'boolean') return value ? 'Yes' : 'No';
  if (field.fieldType === 'currency') return `PKR ${value}`;
  return String(value);
};

/** The first few displayable fields to show as list columns (status handled separately). */
export const listColumns = (entity: PreviewEntityMeta): PreviewFieldMeta[] =>
  entity.fields.filter((f) => !f.isStatus && f.fieldType !== 'richtext').slice(0, 4);

/** Fields shown in a create/edit form (everything except the workflow status). */
export const formFields = (entity: PreviewEntityMeta): PreviewFieldMeta[] =>
  entity.fields.filter((f) => !f.isStatus);

export const stateLabel = (workflow: PreviewWorkflowMeta | undefined, statusKey?: string): string => {
  if (!workflow || !statusKey) return statusKey ?? '—';
  return workflow.states.find((s) => s.key === statusKey)?.label ?? statusKey;
};

/** Tailwind classes for a workflow state pill (initial=teal, final=slate, mid=indigo). */
export const stateColor = (workflow: PreviewWorkflowMeta | undefined, statusKey?: string): string => {
  const s = workflow?.states.find((x) => x.key === statusKey);
  if (!s) return 'bg-slate-100 text-slate-600';
  if (s.isInitial) return 'bg-teal-50 text-teal-700 border border-teal-100';
  if (s.isFinal) return 'bg-slate-100 text-slate-600 border border-slate-200';
  return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
};
