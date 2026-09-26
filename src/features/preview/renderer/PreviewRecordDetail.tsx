import React from 'react';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { StateBadge } from './StateBadge';
import { PreviewTransitionBar } from './PreviewTransitionBar';
import { formFields, formatValue, recordLabel } from './format';
import type { PreviewEntityMeta, PreviewRecord, PreviewSpecMeta } from '../../../types/preview.types';

interface Props {
  entity: PreviewEntityMeta;
  meta: PreviewSpecMeta;
  records: Record<string, PreviewRecord[]>;
  record: PreviewRecord;
  activeRoleKey: string;
  transitioning: boolean;
  onBack: () => void;
  onEdit: () => void;
  onTransition: (to: string) => void;
  onOpenRelated: (entityKey: string, recordId: string) => void;
}

export const PreviewRecordDetail: React.FC<Props> = ({
  entity, meta, records, record, activeRoleKey, transitioning, onBack, onEdit, onTransition, onOpenRelated,
}) => {
  const fields = formFields(entity);
  const isWf = entity.isWorkflow && !!meta.workflow;

  // hasMany: other entities whose reference field points at this entity.
  const related = meta.entities
    .flatMap((e) => e.fields.filter((f) => f.ref?.targetKey === entity.key).map((f) => ({ e, f })))
    .map(({ e, f }) => ({ e, f, rows: (records[e.key] ?? []).filter((r) => r[f.attrName] === record.id) }))
    .filter((x) => x.rows.length > 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <button onClick={onBack} className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1">
        <ArrowLeft size={15} /> Back to {entity.label}
      </button>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-poppins text-2xl font-bold text-slate-900">{recordLabel(entity, record)}</h1>
          {isWf && <StateBadge workflow={meta.workflow} statusKey={record.status} />}
        </div>
        <Button variant="outline" onClick={onEdit} className="flex items-center gap-2">
          <Pencil size={15} /> Edit
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {fields.map((f) => (
            <div key={f.attrName}>
              <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{f.specName}</dt>
              <dd className="text-sm text-slate-800 mt-0.5">{formatValue(f, record[f.attrName], meta, records)}</dd>
            </div>
          ))}
        </dl>
      </div>

      {isWf && meta.workflow && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-poppins font-bold text-slate-800 mb-4">Advance workflow</h2>
          <PreviewTransitionBar
            workflow={meta.workflow}
            roles={meta.roles}
            record={record}
            activeRoleKey={activeRoleKey}
            busy={transitioning}
            onTransition={onTransition}
          />
        </div>
      )}

      {related.map(({ e, rows }) => (
        <div key={e.key} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-poppins font-bold text-slate-800 mb-3">{e.label}</h2>
          <ul className="divide-y divide-slate-50">
            {rows.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => onOpenRelated(e.key, r.id)}
                  className="w-full text-left py-2 text-sm text-slate-700 hover:text-teal-700 flex items-center justify-between"
                >
                  <span>{recordLabel(e, r)}</span>
                  {e.isWorkflow && <StateBadge workflow={meta.workflow} statusKey={r.status} />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
