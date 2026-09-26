import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { FieldEditorRow } from './FieldEditorRow';
import type { SpecEntity, SpecField } from '../../../types/spec.types';

interface Props {
  entity: SpecEntity;
  /** Plain-language explanation for this collection (FE5.6). */
  explanation?: string;
  disabled?: boolean;
  onChange: (next: SpecEntity) => void;
}

/** One data collection: its plain-language explanation plus an editable field list. (FE5.4–5.6) */
export const EntityCard: React.FC<Props> = ({ entity, explanation, disabled, onChange }) => {
  // Name of the field that was just added, so its row opens in edit mode.
  const [newFieldName, setNewFieldName] = useState<string | null>(null);

  const replaceField = (index: number, next: SpecField) => {
    onChange({ ...entity, fields: entity.fields.map((f, i) => (i === index ? next : f)) });
    setNewFieldName(null);
  };

  const removeField = (index: number) => {
    onChange({ ...entity, fields: entity.fields.filter((_, i) => i !== index) });
    setNewFieldName(null);
  };

  const addField = () => {
    const taken = new Set(entity.fields.map((f) => f.name.toLowerCase()));
    let name = 'New field';
    let n = 2;
    while (taken.has(name.toLowerCase())) name = `New field ${n++}`;
    onChange({ ...entity, fields: [...entity.fields, { name, type: 'text' }] });
    setNewFieldName(name);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-teal-300 transition-colors">
      <div className="flex items-start justify-between mb-2 gap-3">
        <h3 className="font-semibold text-slate-800 text-lg">{entity.label}</h3>
        {entity.isWorkflowEntity && (
          <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shrink-0 mt-1.5">
            WORKFLOW
          </span>
        )}
      </div>

      {!!explanation && (
        <p className="text-xs text-slate-500 leading-relaxed mb-4 italic">{explanation}</p>
      )}

      <ul className="space-y-3">
        {entity.fields.map((field, i) => (
          <FieldEditorRow
            key={`${entity.key}-${i}-${field.name}`}
            field={field}
            siblingNames={entity.fields.filter((_, j) => j !== i).map((f) => f.name)}
            disabled={disabled}
            startEditing={newFieldName === field.name}
            onChange={(next) => replaceField(i, next)}
            onDelete={() => removeField(i)}
          />
        ))}
        {entity.fields.length === 0 && (
          <li className="text-xs text-slate-400">No fields yet — add the details you need to record.</li>
        )}
      </ul>

      <button
        type="button"
        onClick={addField}
        disabled={disabled}
        aria-label={`Add a field to ${entity.label}`}
        className="mt-4 text-xs font-bold text-teal-600 hover:text-teal-800 disabled:opacity-40 flex items-center gap-1"
      >
        <PlusCircle size={14} /> Add field
      </button>
    </div>
  );
};
