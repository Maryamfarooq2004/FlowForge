import React from 'react';
import { ArrowRight, AlertTriangle, Lock } from 'lucide-react';
import { cn } from '../../../utils/classNames';
import type { SpecState, SpecTransition, SpecRole } from '../../../types/spec.types';

interface Props {
  states: SpecState[];
  transitions: SpecTransition[];
  roles: SpecRole[];
}

/**
 * The workflow, shown honestly: the stages AND every transition between them.
 * The old view drew states as a single straight line, which misrepresents any
 * branching workflow (e.g. school admissions branch to Accepted or Rejected). (FE5.4)
 */
export const WorkflowGraph: React.FC<Props> = ({ states, transitions, roles }) => {
  const sorted = [...states].sort((a, b) => a.order - b.order);
  const labelOf = (key: string) => states.find((s) => s.key === key)?.label;
  const roleName = (key?: string) => roles.find((r) => r.key === key)?.name;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
      {/* Stages */}
      <div className="overflow-x-auto">
        <div className="flex items-center min-w-max pt-6">
          {sorted.map((state, i) => (
            <React.Fragment key={state.key}>
              {i > 0 && <div className="px-4 text-slate-300"><ArrowRight size={22} /></div>}
              <div className="relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  {state.isInitial ? 'START' : state.isFinal ? 'END' : `STEP ${state.order}`}
                </div>
                <div className={cn(
                  'px-6 py-4 rounded-xl border-2 shadow-sm font-semibold min-w-40 text-center',
                  state.isInitial
                    ? 'border-[#0F766E] bg-teal-50 text-[#0F766E]'
                    : state.isFinal
                      ? 'border-slate-400 bg-slate-50 text-slate-700'
                      : 'border-slate-300 bg-white text-slate-700'
                )}>
                  {state.label}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Transitions — who can move work from where to where */}
      <div className="border-t border-slate-100 pt-6">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          Moves ({transitions.length})
        </h3>
        {transitions.length === 0 && (
          <p className="text-sm text-slate-400">No moves defined — work cannot progress between stages.</p>
        )}
        <ul className="space-y-2">
          {transitions.map((t, i) => {
            const from = labelOf(t.from);
            const to = labelOf(t.to);
            const broken = !from || !to;
            return (
              <li
                key={`${t.from}-${t.to}-${i}`}
                className={cn(
                  'flex items-center gap-3 flex-wrap text-sm rounded-xl px-4 py-2.5 border',
                  broken ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50/60'
                )}
              >
                {broken && <AlertTriangle size={15} className="text-amber-500 shrink-0" />}
                <span className="font-medium text-slate-700">{from || t.from}</span>
                <ArrowRight size={14} className="text-slate-400 shrink-0" />
                <span className="font-bold text-[#0F766E]">{t.label}</span>
                <ArrowRight size={14} className="text-slate-400 shrink-0" />
                <span className="font-medium text-slate-700">{to || t.to}</span>
                <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold shrink-0">
                  {t.role ? (
                    <>
                      <Lock size={12} className="text-indigo-400" />
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {roleName(t.role) || t.role}
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-400">Any role</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
