import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import notificationService from '../services/notificationService';
import type { NotificationListResult, AlertTrigger } from '../types/notification.types';
import type { ApiError } from '../types/global.types';

const listKey = ['notifications', 'list'];
const countKey = ['notifications', 'unread-count'];
const alertConfigKey = (projectId?: string) => ['alert-config', projectId];

/** Unread badge count — polled every 30s (platform short-poll convention). */
export const useUnreadCount = (enabled = true) =>
  useQuery({
    queryKey: countKey,
    queryFn: () => notificationService.unreadCount().then((r) => r.data.data!.count),
    enabled,
    retry: false,
    refetchInterval: 30_000,
  });

/** Full notification list (bell panel + notifications page). */
export const useNotifications = (enabled = true) =>
  useQuery<NotificationListResult>({
    queryKey: listKey,
    queryFn: () => notificationService.list().then((r) => r.data.data!),
    enabled,
    retry: false,
  });

const invalidateBoth = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: listKey });
  qc.invalidateQueries({ queryKey: countKey });
};

export const useMarkRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => invalidateBoth(qc),
  });
};

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => invalidateBoth(qc),
  });
};

// ── Generated-app alert config (Set Up Alerts) ──

export const useAlertConfig = (projectId?: string) =>
  useQuery<AlertTrigger[]>({
    queryKey: alertConfigKey(projectId),
    queryFn: () => notificationService.getAlertConfig(projectId!).then((r) => r.data.data!.triggers),
    enabled: !!projectId,
    retry: false,
  });

export const useSaveAlertConfig = (projectId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (triggers: AlertTrigger[]) => notificationService.saveAlertConfig(projectId!, triggers),
    onSuccess: (res) => {
      qc.setQueryData(alertConfigKey(projectId), res.data.data!.triggers);
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Could not save alert settings.');
    },
  });
};
