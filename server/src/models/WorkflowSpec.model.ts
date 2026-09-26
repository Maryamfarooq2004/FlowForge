import mongoose, { Document, Schema } from 'mongoose';
import {
  SpecEntity,
  SpecRole,
  SpecState,
  SpecTransition,
  SpecRule,
  SpecNotificationTrigger,
  SpecSuggestion,
  SpecRisk,
  SpecExplanation,
  SpecChecklistItem,
} from '../types/spec.types';

export type WorkflowSpecStatus = 'draft' | 'validated' | 'approved';

export interface IWorkflowSpec extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  domain: 'clinic' | 'school';
  version: number;
  status: WorkflowSpecStatus;
  entities: SpecEntity[];
  roles: SpecRole[];
  states: SpecState[];
  transitions: SpecTransition[];
  businessRules: SpecRule[];
  notificationTriggers: SpecNotificationTrigger[];
  suggestions: SpecSuggestion[];
  risks: SpecRisk[];
  explanations: SpecExplanation[];
  checklist: SpecChecklistItem[];
  completionScore: number;
  validationErrors: string[];
  resolvedRiskIds: string[];
  confirmedChecklistKeys: string[];
  provider: 'gemini' | 'deterministic';
  generatedAt?: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Complex nested arrays are stored as Mixed and always replaced wholesale via
// $set in the service layer, so change tracking on sub-paths is not needed.
const workflowSpecSchema = new Schema(
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
    version: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['draft', 'validated', 'approved'],
      default: 'draft',
    },
    entities: { type: Schema.Types.Mixed, default: [] },
    roles: { type: Schema.Types.Mixed, default: [] },
    states: { type: Schema.Types.Mixed, default: [] },
    transitions: { type: Schema.Types.Mixed, default: [] },
    businessRules: { type: Schema.Types.Mixed, default: [] },
    notificationTriggers: { type: Schema.Types.Mixed, default: [] },
    suggestions: { type: Schema.Types.Mixed, default: [] },
    risks: { type: Schema.Types.Mixed, default: [] },
    explanations: { type: Schema.Types.Mixed, default: [] },
    checklist: { type: Schema.Types.Mixed, default: [] },
    completionScore: { type: Number, default: 0 },
    validationErrors: { type: [String], default: [] },
    // The user's own review state. Kept OUTSIDE risks/checklist because those two
    // arrays are recomputed from scratch by validateSpec on every save.
    resolvedRiskIds: { type: [String], default: [] },
    confirmedChecklistKeys: { type: [String], default: [] },
    provider: { type: String, enum: ['gemini', 'deterministic'], default: 'deterministic' },
    generatedAt: { type: Date },
    approvedAt: { type: Date },
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

export const WorkflowSpec = mongoose.model<IWorkflowSpec>(
  'WorkflowSpec',
  workflowSpecSchema
);
