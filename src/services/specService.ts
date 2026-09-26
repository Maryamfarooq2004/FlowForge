import axiosInstance from '../lib/axios';
import type { ApiResponse } from '../types/api.types';
import type { WorkflowSpec } from '../types/spec.types';

type SpecResponse = ApiResponse<{ spec: WorkflowSpec }>;

const specService = {
  // Extraction calls a real LLM and regularly runs past the shared 30s timeout;
  // the server still finishes, so a client-side abort only strands the user on a
  // stale blueprint with a misleading "server unreachable" error.
  generate: (projectId: string) =>
    axiosInstance.post<SpecResponse>(`/spec/${projectId}/generate`, undefined, { timeout: 120000 }),

  get: (projectId: string) =>
    axiosInstance.get<SpecResponse>(`/spec/${projectId}`),

  update: (projectId: string, updates: Partial<WorkflowSpec>) =>
    axiosInstance.patch<SpecResponse>(`/spec/${projectId}`, updates),

  applySuggestion: (projectId: string, suggestionId: string, applied: boolean) =>
    axiosInstance.patch<SpecResponse>(
      `/spec/${projectId}/suggestions/${suggestionId}`,
      { applied }
    ),

  resolveRisk: (projectId: string, riskId: string, resolved: boolean) =>
    axiosInstance.patch<SpecResponse>(`/spec/${projectId}/risks/${riskId}`, { resolved }),

  confirmChecklistItem: (projectId: string, key: string, confirmed: boolean) =>
    axiosInstance.patch<SpecResponse>(`/spec/${projectId}/checklist/${key}`, { confirmed }),

  approve: (projectId: string) =>
    axiosInstance.post<SpecResponse>(`/spec/${projectId}/approve`),
};

export default specService;
