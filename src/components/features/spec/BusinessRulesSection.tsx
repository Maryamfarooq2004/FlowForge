import React, { useState } from 'react';
import { ScrollText, Pencil, Trash2, PlusCircle, Check, X } from 'lucide-react';
import type { SpecRule } from '../../../types/spec.types';

interface Props {
  rules: SpecRule[];
  disabled?: boolean;
  onChange: (next: SpecRule[]) => void;
}

/**
 * The business rules the generated app must honour. Rules were previously stored
 * and generated from but never shown anywhere in the UI. (FE5.4 + FE5.5)
 */
export const BusinessRulesSection: React.FC<Props> = ({ rules, disabled, onChange }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [newRule, setNewRule] = useState('');

  const beginEdit = (index: number) => {
    setDraft(rules[index].text);
    setEditingIndex(index);
  };

  const saveEdit = (index: number) => {
    const text = draft.trim();
    if (!text) return;
    onChange(rules.map((r, i) => (i === index ? { ...r, text } : r)));
    setEditingIndex(null);
  };

  const remove = (index: number) => {
    onChange(rules.filter((_, i) => i !== index));
    setEditingIndex(null);
  };

  const add = () => {
    const text = newRule.trim();
    if (!text) return;
    if (rules.some((r) => r.text.trim().toLowerCase() === text.toLowerCase())) return;
    onChange([...rules, { text, category: 'custom' }]);
    setNewRule('');
  };

  return (
    <section className="pt-8 border-t border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-poppins text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ScrollText size={22} className="text-teal-600" /> The Rules Your App Will Follow
        </h2>
        <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-bold">
          {rules.length} {rules.length === 1 ? 'Rule' : 'Rules'}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-50">
        {rules.length === 0 && (
          <p className="p-5 text-sm text-slate-400">
            No business rules yet — add the rules your staff follow.
          </p>
        )}

        {rules.map((rule, i) => (
          <div key={`${i}-${rule.text.slice(0, 24)}`} className="p-4 group">
            {editingIndex === i ? (
              <div className="space-y-2">
                <textarea
                  value={draft}
                  autoFocus
                  aria-label="Rule text"
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingIndex(null)}
                    aria-label="Cancel editing rule"
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1"
                  >
                    <X size={14} /> Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => saveEdit(i)}
                    disabled={!draft.trim() || disabled}
                    aria-label="Save rule"
                    className="text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0D6B63] disabled:opacity-40 rounded-lg px-3 py-1.5 flex items-center gap-1"
                  >
                    <Check size={14} /> Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-slate-700 leading-relaxed">{rule.text}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => beginEdit(i)}
                    disabled={disabled}
                    aria-label={`Edit rule ${i + 1}`}
                    className="text-slate-300 hover:text-teal-600 disabled:opacity-40 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    disabled={disabled}
                    aria-label={`Delete rule ${i + 1}`}
                    className="text-slate-300 hover:text-red-500 disabled:opacity-40 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="p-4 flex items-center gap-2">
          <input
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            aria-label="New business rule"
            placeholder="Add a rule — e.g. A doctor must confirm every appointment"
            className="border border-slate-200 rounded-lg h-9 px-2.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E]"
          />
          <button
            type="button"
            onClick={add}
            disabled={disabled || !newRule.trim()}
            aria-label="Add business rule"
            className="text-xs font-bold text-teal-600 hover:text-teal-800 disabled:opacity-40 flex items-center gap-1 shrink-0"
          >
            <PlusCircle size={14} /> Add rule
          </button>
        </div>
      </div>
    </section>
  );
};
