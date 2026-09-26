import mongoose, { Document, Schema } from 'mongoose';

/**
 * Audit trail for security- and lifecycle-critical actions
 * (login, register, project create, spec approval, generation, deploy, export).
 * Retained indefinitely (SRS SEC-6 requires >= 90 days).
 */
export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  action: string;
  projectId?: mongoose.Types.ObjectId;
  ip?: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    ip: { type: String },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
