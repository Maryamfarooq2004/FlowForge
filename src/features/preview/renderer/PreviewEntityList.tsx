import React from 'react';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Table, THead, TBody, TR, TH, TD } from '../../../components/ui/Table';
import { StateBadge } from './StateBadge';
import { formatValue, listColumns, recordLabel } from './format';
import { usePreviewTheme } from './theme';
import type { PreviewEntityMeta, PreviewRecord, PreviewSpecMeta } from '../../../types/preview.types';

interface Props {
  entity: PreviewEntityMeta;
  meta: PreviewSpecMeta;
  records: Record<string, PreviewRecord[]>;
  onNew: () => void;
  onView: (record: PreviewRecord) => void;
  onEdit: (record: PreviewRecord) => void;
  onDelete: (record: PreviewRecord) => void;
}

export const PreviewEntityList: React.FC<Props> = ({ entity, meta, records, onNew, onView, onEdit, onDelete }) => {
  const { brand, fonts } = usePreviewTheme();
  const rows = records[entity.key] ?? [];
  const cols = listColumns(entity);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: fonts.heading }}>{entity.label}</h1>
          <p className="text-sm text-slate-500 mt-1">{rows.length} record{rows.length === 1 ? '' : 's'}</p>
        </div>
        <Button onClick={onNew} className="flex items-center gap-2 text-white" style={{ backgroundColor: brand.primary }}>
          <Plus size={16} /> New {entity.modelName}
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        {rows.length === 0 ? (
          <div className="p-10">
            <EmptyState
              title={`No ${entity.label.toLowerCase()} yet`}
              subtitle="Create the first record to see it here."
              actionLabel={`New ${entity.modelName}`}
              onAction={onNew}
            />
          </div>
        ) : (
          <Table>
            <THead>
              <TR>
                {cols.map((c) => (
                  <TH key={c.attrName}>{c.specName}</TH>
                ))}
                {entity.isWorkflow && <TH>Status</TH>}
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.id}>
                  {cols.map((c, i) => (
                    <TD key={c.attrName} className={i === 0 ? 'font-medium text-slate-800' : ''}>
                      {i === 0 && !c.ref ? recordLabel(entity, row) : formatValue(c, row[c.attrName], meta, records)}
                    </TD>
                  ))}
                  {entity.isWorkflow && (
                    <TD>
                      <StateBadge workflow={meta.workflow} statusKey={row.status} />
                    </TD>
                  )}
                  <TD className="text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button onClick={() => onView(row)} className="p-1.5 text-slate-400 hover:text-teal-600 rounded" title="View">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => onEdit(row)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded" title="Edit">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => onDelete(row)} className="p-1.5 text-slate-400 hover:text-red-500 rounded" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
};
