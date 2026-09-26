import mongoose, { Document, Schema } from 'mongoose';

/**
 * Per-project configuration of the GENERATED app's notification triggers,
 * seeded from the approved WorkflowSpec's `notificationTriggers` and edited on
 * the "Set Up Alerts" screen. This is what the code generator emits into the
 * built app's `config/notifications.ts` — distinct from the platform's own
 * Notification feed (see Notification.model.ts).
 */
export type AlertChannel = 'email' | 'in-app' | 'both';

export interface IAlertTrigger {
  event: string;
  channel: AlertChannel;
  enabled: boolean;
  description?: string;
}

export interface INotificationConfig extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  triggers: IAlertTrigger[];
  createdAt: Date;
  updatedAt: Date;
}

const triggerSchema = new Schema<IAlertTrigger>(
  {
    event: { type: String, required: true },
    channel: { type: String, enum: ['email', 'in-app', 'both'], default: 'both' },
    enabled: { type: Boolean, default: true },
    description: { type: String },
  },
  { _id: false }
);

const notificationConfigSchema = new Schema<INotificationConfig>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    triggers: { type: [triggerSchema], default: [] },
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

export const NotificationConfig = mongoose.model<INotificationConfig>(
  'NotificationConfig',
  notificationConfigSchema
);
