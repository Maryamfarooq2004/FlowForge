import axiosInstance from '../lib/axios';
import type { ApiResponse } from '../types/api.types';
import type { AppNotification, NotificationListResult, AlertTrigger } from '../types/notification.types';

type ListResponse = ApiResponse<NotificationListResult>;
type CountResponse = ApiResponse<{ count: number }>;
type MarkResponse = ApiResponse<{ notification: AppNotification | null }>;
type MarkAllResponse = ApiResponse<{ modified: number }>;
type AlertConfigResponse = ApiResponse<{ triggers: AlertTrigger[] }>;

const notificationService = {
  list: (params?: { limit?: number; before?: string }) =>
    axiosInstance.get<ListResponse>('/notifications', { params }),

  unreadCount: () => axiosInstance.get<CountResponse>('/notifications/unread-count'),

  markRead: (id: string) => axiosInstance.patch<MarkResponse>(`/notifications/${id}/read`),

  markAllRead: () => axiosInstance.post<MarkAllResponse>('/notifications/read-all'),

  getAlertConfig: (projectId: string) =>
    axiosInstance.get<AlertConfigResponse>(`/notifications/config/${projectId}`),

  saveAlertConfig: (projectId: string, triggers: AlertTrigger[]) =>
    axiosInstance.put<AlertConfigResponse>(`/notifications/config/${projectId}`, { triggers }),
};

export default notificationService;
