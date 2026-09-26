import React, { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { cn } from '../../../utils/classNames';
import type { SpecField, FieldType } from '../../../types/spec.types';
import { FIELD_TYPE_LABEL, FIELD_TYPES } from './fieldTypes';

const inputCls =
  'border border-slate-200 rounded-lg h-9 px-2.5 text-sm w-full bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E]';

interface Props {
  field: SpecField;
  /** Field names already used by the entity, excluding this one — blocks duplicates. */
  siblingNames: string[];
  disabled?: boolean;
  /** Open in edit mode immediately (used for a freshly added field). */
  startEditing?: boolean;
  onChange: (next: SpecField) => void;
  onDelete: () => void;
}

/** One row of an entity's field list: read-only view, or an inline editor. (FE5.5) */
export const FieldEditorRow: React.FC<Props> = ({
  field, siblingNames, disabled, startEditing, onChange, onDelete,
}) => {
  const [editing, setEditing] = useState(!!startEditing);
  const [draft, setDraft] = useState<SpecField>(field);
  const [optionsText, setOptionsText] = useState((field.options || []).join(', '));

  const beginEdit = () => {
    setDraft(field);
    setOptionsText((field.options || []).join(', '));
    setEditing(true);
  };

  const name = draft.name.trim();
  const duplicate = siblingNames.some((n) => n.toLowerCase() === name.toLowerCase());
  const options = optionsText.split(',').map((o) => o.trim()).filter(Boolean);
  const enumTooFew = draft.type === 'enum' && options.length < 2;
  const error = !name
    ? 'A field needs a name.'
    : duplicate
      ? 'That name is already used in this collection.'
      : enumTooFew
        ? 'A choice field needs at least two options.'
        : '';

  const save = () => {
    if (error) return;
    const next: SpecField = { ...draft, name };
    if (next.type === 'enum') next.options = options;
    else delete next.options;
    if (next.type !== 'reference') delete next.reference;
    // A unique foreign key would silently turn a one-to-many link into one-to-one.
    if (next.type === 'reference') delete next.unique;
    onChange(next);
    setEditing(false);
  };

  if (!editing) {
    return (
      <li className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0 group">
        <div className="min-w-0">
          <span className="text-sm text-slate-700">
            {field.name}
            {field.required && <span className="text-red-400 ml-1">*</span>}
          </span>
          {field.type === 'enum' && !!field.options?.length && (
            <p className="text-[11px] text-slate-400 truncate">↳ {field.options.join(', ')}</p>
          )}
          {field.type === 'reference' && field.reference && (
            <p className="text-[11px] text-indigo-500">→ linked to {field.reference}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {field.unique && (
            <span
              className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded"
              title="No two records may share this value"
            >
              UNIQUE
            </span>
          )}
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
            {FIELD_TYPE_LABEL[field.type]}
          </span>
          <button
            type="button"
            onClick={beginEdit}
            disabled={disabled}
            aria-label={`Edit field ${field.name}`}
            className="text-slate-300 hover:text-teal-600 disabled:opacity-40 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={disabled}
            aria-label={`Delete field ${field.name}`}
            className="text-slate-300 hover:text-red-500 disabled:opacity-40 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="border border-teal-200 bg-teal-50/40 rounded-xl p-3 space-y-2">
      <div className="flex gap-2">
        <input
          className={cn(inputCls, 'flex-1')}
          value={draft.name}
          autoFocus
          aria-label="Field name"
          placeholder="Field name"
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
        <select
          className={cn(inputCls, 'w-36')}
          value={draft.type}
          aria-label="Field type"
          onChange={(e) => setDraft({ ...draft, type: e.target.value as FieldType })}
        >
          {FIELD_TYPES.map((t) => (
            <option key={t} value={t}>{FIELD_TYPE_LABEL[t]}</option>
          ))}
        </select>
      </div>

      {draft.type === 'enum' && (
        <input
          className={inputCls}
          value={optionsText}
          aria-label="Choices, comma separated"
          placeholder="Choices, comma separated — e.g. Booked, Seen, Cancelled"
          onChange={(e) => setOptionsText(e.target.value)}
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={!!draft.required}
              className="accent-[#0F766E]"
              onChange={(e) => setDraft({ ...draft, required: e.target.checked })}
            />
            Required
          </label>
          {/* Drives a real UNIQUE constraint + index in the generated database.
              Declared by the user — the generator never infers uniqueness. */}
          {draft.type !== 'reference' && (
            <label
              className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer"
              title="No two records may share this value — enforced by the generated database."
            >
              <input
                type="checkbox"
                checked={!!draft.unique}
                className="accent-[#0F766E]"
                onChange={(e) => setDraft({ ...draft, unique: e.target.checked })}
              />
              Must be unique
            </label>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(false)}
            aria-label="Cancel editing field"
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            <X size={14} /> Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!!error || disabled}
            aria-label="Save field"
            className="text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0D6B63] disabled:opacity-40 rounded-lg px-3 py-1.5 flex items-center gap-1"
          >
            <Check size={14} /> Save
          </button>
        </div>
      </div>

      {!!error && <p className="text-[11px] text-red-500">{error}</p>}
    </li>
  );
};
