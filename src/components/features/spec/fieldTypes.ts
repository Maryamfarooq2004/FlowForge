import type { FieldType } from '../../../types/spec.types';

/** Human-facing labels for the spec field types, shared by the studio components. */
export const FIELD_TYPE_LABEL: Record<FieldType, string> = {
  text: 'TEXT', richtext: 'RICH TEXT', number: 'NUMBER', currency: 'CURRENCY',
  date: 'DATE', time: 'TIME', boolean: 'YES/NO', enum: 'CHOICE',
  phone: 'PHONE', email: 'EMAIL', reference: 'LINK',
};

export const FIELD_TYPES = Object.keys(FIELD_TYPE_LABEL) as FieldType[];
