import axiosInstance from '../lib/axios';
import type { ApiResponse } from '../types/api.types';
import type { GenerationRun } from '../types/generation.types';

type RunResponse = ApiResponse<{ run: GenerationRun }>;

const generationService = {
  /** Begin an async generation run for a project's approved spec (202). */
  start: (projectId: string) =>
    axiosInstance.post<RunResponse>(`/generation/${projectId}/start`),

  /** Latest run for a project (for polling / resuming the progress page). */
  latest: (projectId: string) =>
    axiosInstance.get<RunResponse>(`/generation/${projectId}/latest`),

  /** A specific run by id (logs / artifacts pages). */
  getRun: (runId: string) =>
    axiosInstance.get<RunResponse>(`/generation/run/${runId}`),
};

export default generationService;
