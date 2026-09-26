import mongoose, { Document, Schema } from 'mongoose';

/**
 * Per-project demo-data store for the live in-app Preview (Module 7, Phase 4).
 *
 * The preview renders the generated clinic/school app dynamically from the
 * approved WorkflowSpec — the schema/metadata is recomputed at request time via
 * the generator's `buildContext(...).ir`, so it is NOT stored here. This model
 * persists ONLY the demo records the user creates/edits while playing with the
 * preview, plus the acting demo-role (which gates workflow transitions).
 *
 * `records` is schemaless per entity (columns come from the spec at runtime), so
 * it is stored as Mixed and replaced wholesale via $set — the same convention as
 * WorkflowSpec / IntakeBundle.
 */

export interface PreviewRecord {
  id: string; // uuid
  status?: string; // only for the workflow entity
  createdAt: string; // ISO
  updatedAt: string; // ISO
  [attr: string]: any; // dynamic fields, keyed by the spec field's attrName
}

export interface IPreviewSandbox extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  domain: 'clinic' | 'school';
  specVersion: number; // WorkflowSpec.version captured at init (staleness signal)
  activeRoleKey: string;
  records: Record<string, PreviewRecord[]>; // { [entityKey]: rows }
  seeded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const previewSandboxSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    domain: { type: String, enum: ['clinic', 'school'], required: true },
    specVersion: { type: Number, default: 1 },
    activeRoleKey: { type: String, default: '' },
    // Dynamic demo rows keyed by entity key — replaced wholesale via $set.
    records: { type: Schema.Types.Mixed, default: {} },
    seeded: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const PreviewSandbox = mongoose.model<IPreviewSandbox>(
  'PreviewSandbox',
  previewSandboxSchema
);
