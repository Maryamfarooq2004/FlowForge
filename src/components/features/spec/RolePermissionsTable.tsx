import React, { useState } from 'react';
import { CheckCircle2, XCircle, Trash2, PlusCircle } from 'lucide-react';
import type { SpecRole } from '../../../types/spec.types';

const initials = (name: string) =>
  name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

interface Props {
  role: SpecRole;
  disabled?: boolean;
  onChange: (next: SpecRole) => void;
}

/** One role with an editable capability matrix. (FE5.5 — "adjust permissions") */
export const RolePermissionsTable: React.FC<Props> = ({ role, disabled, onChange }) => {
  const [newAction, setNewAction] = useState('');

  const toggle = (index: number) =>
    onChange({
      ...role,
      permissions: role.permissions.map((p, i) => (i === index ? { ...p, allowed: !p.allowed } : p)),
    });

  const remove = (index: number) =>
    onChange({ ...role, permissions: role.permissions.filter((_, i) => i !== index) });

  const add = () => {
    const action = newAction.trim();
    if (!action) return;
    if (role.permissions.some((p) => p.action.toLowerCase() === action.toLowerCase())) return;
    onChange({ ...role, permissions: [...role.permissions, { action, allowed: true }] });
    setNewAction('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/3 md:border-r border-slate-100 md:pr-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold shrink-0">
            {initials(role.name)}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2">
              {role.name}
              {role.manuallyAdded && (
                <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">ADDED</span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{role.description}</p>
          </div>
        </div>
      </div>

      <div className="w-full md:w-2/3">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="pb-3 w-3/4">Action</th>
              <th className="pb-3 w-1/4 text-center">Allowed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {role.permissions.map((p, i) => (
              <tr key={p.action} className="group">
                <td className="py-2.5 font-medium text-slate-700">
                  <span className="flex items-center gap-2">
                    {p.action}
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      disabled={disabled}
                      aria-label={`Remove ${p.action} from ${role.name}`}
                      className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 disabled:opacity-40 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </span>
                </td>
                <td className="py-2.5 text-center">
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    disabled={disabled}
                    aria-pressed={p.allowed}
                    aria-label={`${p.allowed ? 'Disallow' : 'Allow'} ${p.action} for ${role.name}`}
                    className="inline-flex justify-center hover:scale-110 disabled:opacity-40 transition-transform"
                  >
                    {p.allowed
                      ? <CheckCircle2 size={18} className="text-green-500" />
                      : <XCircle size={18} className="text-red-300" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center gap-2 mt-4">
          <input
            value={newAction}
            onChange={(e) => setNewAction(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            aria-label={`New action for ${role.name}`}
            placeholder="Add an action — e.g. Approve Refunds"
            className="border border-slate-200 rounded-lg h-9 px-2.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E]"
          />
          <button
            type="button"
            onClick={add}
            disabled={disabled || !newAction.trim()}
            aria-label={`Add action to ${role.name}`}
            className="text-xs font-bold text-teal-600 hover:text-teal-800 disabled:opacity-40 flex items-center gap-1 shrink-0"
          >
            <PlusCircle size={14} /> Add
          </button>
        </div>
      </div>
    </div>
  );
};
