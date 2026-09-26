import axiosInstance from '../lib/axios';
import type { ApiResponse } from '../types/api.types';
import type {
  AdminStats, AdminUsersResult, AdminUser, AdminDeployment, AdminActivity, AdminUsage,
} from '../types/admin.types';

const adminService = {
  getStats: () => axiosInstance.get<ApiResponse<{ stats: AdminStats }>>('/admin/stats'),

  listUsers: (params?: { search?: string; page?: number; limit?: number }) =>
    axiosInstance.get<ApiResponse<AdminUsersResult>>('/admin/users', { params }),

  setUserRole: (id: string, role: 'user' | 'admin') =>
    axiosInstance.patch<ApiResponse<{ user: AdminUser }>>(`/admin/users/${id}/role`, { role }),

  listDeployments: () =>
    axiosInstance.get<ApiResponse<{ deployments: AdminDeployment[] }>>('/admin/deployments'),

  recentActivity: (limit?: number) =>
    axiosInstance.get<ApiResponse<{ activity: AdminActivity[] }>>('/admin/activity', {
      params: limit ? { limit } : undefined,
    }),

  getUsage: () => axiosInstance.get<ApiResponse<{ usage: AdminUsage }>>('/admin/usage'),
};

export default adminService;
