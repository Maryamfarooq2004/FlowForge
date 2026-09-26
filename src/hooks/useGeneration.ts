import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import generationService from '../services/generationService';
import type { GenerationRun } from '../types/generation.types';
import { isTerminal } from '../types/generation.types';
import type { ApiError } from '../types/global.types';

const latestKey = (projectId?: string) => ['generation', 'latest', projectId];
const runKey = (runId?: string) => ['generation', 'run', runId];

/**
 * Latest run for a project. Polls every ~1.2s while queued/running and stops
 * on a terminal status. A 404 (no run yet) does not retry.
 */
export const useLatestRun = (projectId?: string, opts?: { enabled?: boolean }) =>
  useQuery({
    queryKey: latestKey(projectId),
    queryFn: () => generationService.latest(projectId!).then((r) => r.data.data!.run),
    enabled: !!projectId && (opts?.enabled ?? true),
    retry: false,
    refetchInterval: (query) => {
      const run = query.state.data as GenerationRun | undefined;
      return run && isTerminal(run.status) ? false : 1200;
    },
  });

/** Fetch a specific run (logs / artifacts). Polls until terminal. */
export const useRun = (runId?: string) =>
  useQuery({
    queryKey: runKey(runId),
    queryFn: () => generationService.getRun(runId!).then((r) => r.data.data!.run),
    enabled: !!runId,
    retry: false,
    refetchInterval: (query) => {
      const run = query.state.data as GenerationRun | undefined;
      return run && isTerminal(run.status) ? false : 1500;
    },
  });

/** Start a generation run and seed the latest-run cache with the queued run. */
export const useStartGeneration = (projectId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => generationService.start(projectId!),
    onSuccess: (res) => {
      qc.setQueryData(latestKey(projectId), res.data.data!.run);
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to start code generation.');
    },
  });
};
