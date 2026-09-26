import mongoose, { Document, Schema } from 'mongoose';

/**
 * A single execution of the deterministic code-generation pipeline for a
 * project's approved WorkflowSpec. Powers the (real) progress page + polling,
 * the build-logs view, and the browsable artifact tree.
 *
 * The `artifacts` array carries the full generated file contents so the
 * Artifacts/Logs pages keep working even after the disk workspace is wiped
 * (Railway's filesystem is ephemeral). The disk workspace is retained for the
 * Phase 5 ZIP/GitHub export.
 */

export type GenerationStatus = 'queued' | 'running' | 'completed' | 'failed';

export type GenerationLogLevel = 'info' | 'success' | 'warning' | 'error';

export interface GenerationLog {
  level: GenerationLogLevel;
  time: string; // ISO string (passed in — content stays deterministic-friendly)
  message: string;
}

export interface GenerationArtifact {
  path: string; // workspace-relative, forward-slash, e.g. "src/models/Patient.model.ts"
  lang: string; // "ts" | "sql" | "json" | "js" | "md" | "yaml" | "text"
  size: number; // bytes (UTF-8)
  contents: string;
}

export interface GenerationStats {
  files: number;
  entities: number;
  endpoints: number;
  durationMs: number;
}

export interface IGenerationRun extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  specId: mongoose.Types.ObjectId;
  specVersion: number;
  domain: 'clinic' | 'school';
  status: GenerationStatus;
  stage: number; // 0–6
  stageName: string;
  percent: number; // 0–100
  logs: GenerationLog[];
  artifacts: GenerationArtifact[];
  stats: GenerationStats;
  workspacePath: string;
  error?: string;
  startedAt?: Date;
  finishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// `logs` and `artifacts` are large, frequently-replaced arrays stored as Mixed
// and written wholesale via $set in the service layer (same pattern as
// WorkflowSpec) — no sub-path change tracking needed.
const generationRunSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    specId: { type: Schema.Types.ObjectId, ref: 'WorkflowSpec', required: true },
    specVersion: { type: Number, default: 1 },
    domain: { type: String, enum: ['clinic', 'school'], required: true },
    status: {
      type: String,
      enum: ['queued', 'running', 'completed', 'failed'],
      default: 'queued',
      index: true,
    },
    stage: { type: Number, default: 0 },
    stageName: { type: String, default: 'Queued' },
    percent: { type: Number, default: 0 },
    logs: { type: Schema.Types.Mixed, default: [] },
    artifacts: { type: Schema.Types.Mixed, default: [] },
    stats: {
      type: Schema.Types.Mixed,
      default: () => ({ files: 0, entities: 0, endpoints: 0, durationMs: 0 }),
    },
    workspacePath: { type: String, default: '' },
    error: { type: String },
    startedAt: { type: Date },
    finishedAt: { type: Date },
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

// Fast "latest run for this project" lookups.
generationRunSchema.index({ projectId: 1, createdAt: -1 });

export const GenerationRun = mongoose.model<IGenerationRun>(
  'GenerationRun',
  generationRunSchema
);
