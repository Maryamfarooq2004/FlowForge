import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import adminService from '../services/adminService';
import type { ApiError } from '../types/global.types';

export const useAdminStats = () =>
  useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminService.getStats().then((r) => r.data.data!.stats),
    retry: false,
  });

export const useAdminActivity = (limit?: number) =>
  useQuery({
    queryKey: ['admin', 'activity', limit ?? 30],
    queryFn: () => adminService.recentActivity(limit).then((r) => r.data.data!.activity),
    retry: false,
  });

export const useAdminUsers = (params: { search?: string; page?: number }) =>
  useQuery({
    queryKey: ['admin', 'users', params.search ?? '', params.page ?? 1],
    queryFn: () => adminService.listUsers(params).then((r) => r.data.data!),
    retry: false,
  });

export const useSetUserRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; role: 'user' | 'admin' }) => adminService.setUserRole(vars.id, vars.role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success('Role updated.');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Could not update role.');
    },
  });
};

export const useAdminDeployments = () =>
  useQuery({
    queryKey: ['admin', 'deployments'],
    queryFn: () => adminService.listDeployments().then((r) => r.data.data!.deployments),
    retry: false,
  });

export const useAdminUsage = () =>
  useQuery({
    queryKey: ['admin', 'usage'],
    queryFn: () => adminService.getUsage().then((r) => r.data.data!.usage),
    retry: false,
  });
