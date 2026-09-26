import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { Switch } from '../../../components/ui/Switch';
import { formFields, recordLabel } from './format';
import { usePreviewTheme } from './theme';
import type { PreviewEntityMeta, PreviewFieldMeta, PreviewRecord, PreviewSpecMeta } from '../../../types/preview.types';

interface Props {
  entity: PreviewEntityMeta;
  meta: PreviewSpecMeta;
  records: Record<string, PreviewRecord[]>;
  initial?: PreviewRecord;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (data: Record<string, any>) => void;
}

const inputType = (t: PreviewFieldMeta['fieldType']): string => {
  switch (t) {
    case 'phone': return 'tel';
    case 'email': return 'email';
    case 'number':
    case 'currency': return 'number';
    case 'date': return 'date';
    case 'time': return 'time';
    default: return 'text';
  }
};

export const PreviewRecordForm: React.FC<Props> = ({ entity, meta, records, initial, submitting, onCancel, onSubmit }) => {
  const { brand, fonts } = usePreviewTheme();
  const fields = formFields(entity);
  const [values, setValues] = useState<Record<string, any>>(() => {
    const v: Record<string, any> = {};
    for (const f of fields) v[f.attrName] = initial?.[f.attrName] ?? (f.fieldType === 'boolean' ? false : '');
    return v;
  });

  const set = (attr: string, val: any) => setValues((prev) => ({ ...prev, [attr]: val }));
  const label = (f: PreviewFieldMeta) => `${f.specName}${f.required ? ' *' : ''}`;

  const control = (f: PreviewFieldMeta) => {
    if (f.fieldType === 'boolean') {
      return (
        <div className="flex flex-col space-y-1" key={f.attrName}>
          <span className="text-sm font-medium text-slate-700">{label(f)}</span>
          <div className="h-11 flex items-center">
            <Switch checked={!!values[f.attrName]} onChange={(e) => set(f.attrName, e.target.checked)} />
          </div>
        </div>
      );
    }
    if (f.fieldType === 'enum') {
      return (
        <Select
          key={f.attrName}
          label={label(f)}
          placeholder="Select…"
          value={values[f.attrName] ?? ''}
          onChange={(e) => set(f.attrName, e.target.value)}
          options={(f.enumValues ?? []).map((o) => ({ value: o, label: o }))}
        />
      );
    }
    if (f.ref) {
      const targetEntity = meta.entities.find((e) => e.key === f.ref!.targetKey);
      const rows = records[f.ref.targetKey] ?? [];
      const opts = rows.map((r) => ({ value: r.id, label: targetEntity ? recordLabel(targetEntity, r) : r.id }));
      return (
        <Select
          key={f.attrName}
          label={label(f)}
          disabled={rows.length === 0}
          placeholder={rows.length ? `Select ${f.ref.targetLabel}…` : `Create a ${f.ref.targetLabel} first`}
          value={values[f.attrName] ?? ''}
          onChange={(e) => set(f.attrName, e.target.value)}
          options={opts}
        />
      );
    }
    if (f.fieldType === 'richtext') {
      return (
        <Textarea
          key={f.attrName}
          label={label(f)}
          className="md:col-span-2"
          value={values[f.attrName] ?? ''}
          onChange={(e) => set(f.attrName, e.target.value)}
        />
      );
    }
    return (
      <Input
        key={f.attrName}
        label={label(f)}
        type={inputType(f.fieldType)}
        step={f.fieldType === 'currency' ? '0.01' : undefined}
        value={values[f.attrName] ?? ''}
        onChange={(e) => set(f.attrName, e.target.value)}
      />
    );
  };

  return (
    <div className="max-w-3xl">
      <button onClick={onCancel} className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-4">
        <ArrowLeft size={15} /> Back
      </button>
      <h1 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: fonts.heading }}>
        {initial ? 'Edit' : 'New'} {entity.modelName}
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(values);
        }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{fields.map(control)}</div>
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" isLoading={submitting} className="text-white" style={{ backgroundColor: brand.primary }}>
            {initial ? 'Save changes' : `Create ${entity.modelName}`}
          </Button>
        </div>
      </form>
    </div>
  );
};
