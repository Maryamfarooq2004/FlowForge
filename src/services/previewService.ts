import axiosInstance from '../lib/axios';
import type { ApiResponse } from '../types/api.types';
import type { PreviewState } from '../types/preview.types';

type StateResponse = ApiResponse<{ state: PreviewState }>;

const previewService = {
  /** Idempotent: ensure + seed the sandbox, return full state. */
  init: (projectId: string) =>
    axiosInstance.post<StateResponse>(`/preview/${projectId}/init`),

  getState: (projectId: string) =>
    axiosInstance.get<StateResponse>(`/preview/${projectId}/state`),

  setRole: (projectId: string, roleKey: string) =>
    axiosInstance.patch<StateResponse>(`/preview/${projectId}/role`, { roleKey }),

  createRecord: (projectId: string, entityKey: string, data: Record<string, any>) =>
    axiosInstance.post<StateResponse>(`/preview/${projectId}/entities/${entityKey}`, data),

  updateRecord: (projectId: string, entityKey: string, recordId: string, data: Record<string, any>) =>
    axiosInstance.patch<StateResponse>(`/preview/${projectId}/entities/${entityKey}/${recordId}`, data),

  deleteRecord: (projectId: string, entityKey: string, recordId: string) =>
    axiosInstance.delete<StateResponse>(`/preview/${projectId}/entities/${entityKey}/${recordId}`),

  transition: (projectId: string, entityKey: string, recordId: string, to: string) =>
    axiosInstance.post<StateResponse>(`/preview/${projectId}/entities/${entityKey}/${recordId}/transition`, { to }),

  reset: (projectId: string) =>
    axiosInstance.post<StateResponse>(`/preview/${projectId}/reset`),
};

export default previewService;
