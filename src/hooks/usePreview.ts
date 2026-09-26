import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import previewService from '../services/previewService';
import type { PreviewState } from '../types/preview.types';
import type { ApiError } from '../types/global.types';

const previewKey = (projectId?: string) => ['preview', projectId];

/** Load (and idempotently init/seed) the preview sandbox for a project. */
export const usePreviewState = (projectId?: string) =>
  useQuery({
    queryKey: previewKey(projectId),
    queryFn: () => previewService.init(projectId!).then((r) => r.data.data!.state),
    enabled: !!projectId,
    retry: false,
    staleTime: Infinity, // sandbox only changes through our own mutations
  });

/** Shared mutation wiring: seed the query cache from the returned state. */
const useStateMutation = <TVars>(
  projectId: string | undefined,
  fn: (vars: TVars) => Promise<{ data: { data?: { state: PreviewState } } }>,
  fallback: string
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (res) => {
      const state = res.data.data?.state;
      if (state) qc.setQueryData(previewKey(projectId), state);
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || fallback);
    },
  });
};

export const useSetRole = (projectId?: string) =>
  useStateMutation<string>(projectId, (roleKey) => previewService.setRole(projectId!, roleKey), 'Could not switch role.');

export const useCreateRecord = (projectId?: string) =>
  useStateMutation<{ entityKey: string; data: Record<string, any> }>(
    projectId,
    ({ entityKey, data }) => previewService.createRecord(projectId!, entityKey, data),
    'Could not create the record.'
  );

export const useUpdateRecord = (projectId?: string) =>
  useStateMutation<{ entityKey: string; recordId: string; data: Record<string, any> }>(
    projectId,
    ({ entityKey, recordId, data }) => previewService.updateRecord(projectId!, entityKey, recordId, data),
    'Could not update the record.'
  );

export const useDeleteRecord = (projectId?: string) =>
  useStateMutation<{ entityKey: string; recordId: string }>(
    projectId,
    ({ entityKey, recordId }) => previewService.deleteRecord(projectId!, entityKey, recordId),
    'Could not delete the record.'
  );

export const useTransitionRecord = (projectId?: string) =>
  useStateMutation<{ entityKey: string; recordId: string; to: string }>(
    projectId,
    ({ entityKey, recordId, to }) => previewService.transition(projectId!, entityKey, recordId, to),
    'Could not run that transition.'
  );

export const useResetSandbox = (projectId?: string) =>
  useStateMutation<void>(projectId, () => previewService.reset(projectId!), 'Could not reset the preview.');
