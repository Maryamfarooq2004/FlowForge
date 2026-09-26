import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../../../utils/classNames';
import type { SpecChecklistItem } from '../../../types/spec.types';

interface Props {
  items: SpecChecklistItem[];
  disabled?: boolean;
  onToggle: (key: string, confirmed: boolean) => void;
}

/**
 * Two signals per item, deliberately kept separate (FE5.10):
 *  · the system check  — what the validator found (read-only advice)
 *  · the user's tick   — the actual approval gate
 * An item can be ticked even when its system check is red; the tick is the user
 * taking responsibility, which is exactly what the requirement asks for.
 */
export const ApprovalChecklist: React.FC<Props> = ({ items, disabled, onToggle }) => {
  const ticked = items.filter((c) => c.userConfirmed).length;

  return (
    <div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
        Approval Checklist — {ticked} of {items.length} confirmed
      </span>
      <div className="flex items-center gap-4 flex-wrap">
        {items.map((item) => (
          <label
            key={item.key}
            className={cn(
              'flex items-center gap-2 text-xs font-medium cursor-pointer select-none rounded-lg px-2 py-1 transition-colors',
              item.userConfirmed ? 'text-slate-800 bg-teal-50' : 'text-slate-500 hover:bg-slate-50',
              disabled && 'opacity-60 cursor-not-allowed'
            )}
            title={item.confirmed
              ? 'Our checks pass for this section'
              : "Our checks flag this section — you can still confirm it yourself"}
          >
            <input
              type="checkbox"
              checked={!!item.userConfirmed}
              disabled={disabled}
              aria-label={`Confirm ${item.label}`}
              onChange={(e) => onToggle(item.key, e.target.checked)}
              className="accent-[#0F766E] w-4 h-4"
            />
            {item.label}
            {item.confirmed
              ? <CheckCircle2 size={13} className="text-green-500" aria-label="System check passed" />
              : <Circle size={13} className="text-slate-300" aria-label="System check not satisfied" />}
          </label>
        ))}
      </div>
    </div>
  );
};
