import mongoose, { Document, Schema } from 'mongoose';

/**
 * Tracks a project's export/deploy activity for the Deployment Hub: how many
 * times its ZIP was exported, and an optional user-supplied live URL (we emit
 * deploy config + instructions but do not provision — decision D1).
 */

export type DeploymentStatus = 'none' | 'exported' | 'live';

export interface IDeploymentRecord extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: DeploymentStatus;
  exportCount: number;
  lastExportAt?: Date;
  liveUrl?: string;
  githubRepoUrl?: string; // reserved for a future GitHub push
  createdAt: Date;
  updatedAt: Date;
}

const deploymentRecordSchema = new Schema(
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
    status: { type: String, enum: ['none', 'exported', 'live'], default: 'none' },
    exportCount: { type: Number, default: 0 },
    lastExportAt: { type: Date },
    liveUrl: { type: String },
    githubRepoUrl: { type: String },
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

export const DeploymentRecord = mongoose.model<IDeploymentRecord>(
  'DeploymentRecord',
  deploymentRecordSchema
);
