// Frontend mirror of the backend Notification model (server/src/models/Notification.model.ts).
// Named AppNotification to avoid clashing with the DOM `Notification` global.

export type NotificationType =
  | 'SPEC_READY'
  | 'SPEC_APPROVED'
  | 'GENERATION_STARTED'
  | 'GENERATION_COMPLETED'
  | 'GENERATION_FAILED'
  | 'EXPORT_READY'
  | 'DEPLOY_LIVE';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  projectId?: string;
  createdAt: string;
}

export interface NotificationListResult {
  notifications: AppNotification[];
  unreadCount: number;
}

// Generated-app alert triggers (Set Up Alerts page → NotificationConfig).
export type AlertChannel = 'email' | 'in-app' | 'both';

export interface AlertTrigger {
  event: string;
  channel: AlertChannel;
  enabled: boolean;
  description?: string;
}
