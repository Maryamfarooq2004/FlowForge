import mongoose, { Document, Schema } from 'mongoose';

/**
 * Platform notification — FlowForge telling a *builder* about their project
 * lifecycle (spec ready, generation done, export ready, deploy live, ...).
 * Delivered in-app (bell + notifications page) and optionally by email.
 *
 * Distinct from the generated app's OWN notifications (those live in the
 * emitted app's `notifications` table) and from the WorkflowSpec's
 * `notificationTriggers` (which configure the generated app — see NotificationConfig).
 */
export type NotificationType =
  | 'SPEC_READY'
  | 'SPEC_APPROVED'
  | 'GENERATION_STARTED'
  | 'GENERATION_COMPLETED'
  | 'GENERATION_FAILED'
  | 'EXPORT_READY'
  | 'DEPLOY_LIVE';

export type NotificationChannel = 'in-app' | 'email' | 'both';
export type NotificationEmailStatus = 'none' | 'sent' | 'failed';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  /** In-app deep link the frontend navigates to when the item is clicked. */
  link?: string;
  channel: NotificationChannel;
  emailStatus: NotificationEmailStatus;
  isRead: boolean;
  readAt?: Date;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const NOTIFICATION_TYPES: NotificationType[] = [
  'SPEC_READY',
  'SPEC_APPROVED',
  'GENERATION_STARTED',
  'GENERATION_COMPLETED',
  'GENERATION_FAILED',
  'EXPORT_READY',
  'DEPLOY_LIVE',
];

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    link: { type: String },
    channel: { type: String, enum: ['in-app', 'email', 'both'], default: 'in-app' },
    emailStatus: { type: String, enum: ['none', 'sent', 'failed'], default: 'none' },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    meta: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// "My notifications, newest first" + "my unread count".
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
