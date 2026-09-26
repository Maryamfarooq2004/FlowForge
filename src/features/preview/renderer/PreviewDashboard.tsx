import React from 'react';
import { Database, GitBranch } from 'lucide-react';
import { StateBadge } from './StateBadge';
import { usePreviewTheme } from './theme';
import type { PreviewSpecMeta, PreviewRecord } from '../../../types/preview.types';

interface Props {
  meta: PreviewSpecMeta;
  records: Record<string, PreviewRecord[]>;
  activeRoleName: string;
  onOpenEntity: (key: string) => void;
}

export const PreviewDashboard: React.FC<Props> = ({ meta, records, activeRoleName, onOpenEntity }) => {
  const { brand, fonts } = usePreviewTheme();
  const wf = meta.workflow;
  const wfRows = wf ? records[wf.entityKey] ?? [] : [];
  const tally = wf
    ? wf.states.map((s) => ({ ...s, count: wfRows.filter((r) => r.status === s.key).length }))
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: fonts.heading }}>Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Signed in as <span className="font-semibold text-slate-700">{activeRoleName}</span> · live demo data
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {meta.entities.map((e) => (
          <button
            key={e.key}
            onClick={() => onOpenEntity(e.key)}
            className="text-left bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-teal-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <Database size={18} style={{ color: brand.primary }} />
              {e.isWorkflow && <GitBranch size={14} style={{ color: brand.secondary }} />}
            </div>
            <p className="text-3xl font-bold text-slate-900 font-poppins">{(records[e.key] ?? []).length}</p>
            <p className="text-sm text-slate-500 mt-1">{e.label}</p>
          </button>
        ))}
      </div>

      {wf && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-poppins font-bold text-slate-800 mb-4 flex items-center gap-2">
            <GitBranch size={18} className="text-indigo-500" /> Workflow status
          </h2>
          <div className="flex flex-wrap gap-4">
            {tally.map((s) => (
              <div key={s.key} className="flex items-center gap-2">
                <StateBadge workflow={wf} statusKey={s.key} />
                <span className="text-lg font-bold text-slate-700">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
