import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { cn } from '../../../utils/classNames';
import { usePreviewTheme } from './theme';
import type { PreviewRecord, PreviewRoleMeta, PreviewWorkflowMeta } from '../../../types/preview.types';

interface Props {
  workflow: PreviewWorkflowMeta;
  roles: PreviewRoleMeta[];
  record: PreviewRecord;
  activeRoleKey: string;
  busy: boolean;
  onTransition: (to: string) => void;
}

export const PreviewTransitionBar: React.FC<Props> = ({ workflow, roles, record, activeRoleKey, busy, onTransition }) => {
  const { brand } = usePreviewTheme();
  const available = workflow.transitions.filter((t) => t.from === record.status);
  if (available.length === 0) {
    return <p className="text-sm text-slate-400">No further actions from this state.</p>;
  }

  const roleName = (key?: string) => roles.find((r) => r.key === key)?.name ?? key;

  return (
    <div className="flex flex-wrap gap-3">
      {available.map((t) => {
        const blocked = !!t.roleKey && t.roleKey !== activeRoleKey;
        return (
          <button
            key={`${t.from}-${t.to}`}
            disabled={blocked || busy}
            onClick={() => onTransition(t.to)}
            title={blocked ? `Only ${roleName(t.roleKey)} can do this` : undefined}
            style={blocked ? undefined : { backgroundColor: brand.primary }}
            className={cn(
              'inline-flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-bold transition-colors',
              blocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'text-white'
            )}
          >
            {blocked ? <Lock size={14} /> : <ArrowRight size={14} />}
            {t.label}
          </button>
        );
      })}
    </div>
  );
};
