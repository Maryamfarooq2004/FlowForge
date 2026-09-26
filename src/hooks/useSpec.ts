import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import specService from '../services/specService';
import type { WorkflowSpec } from '../types/spec.types';
import type { ApiError } from '../types/global.types';

const specKey = (projectId?: string) => ['spec', projectId];

/** Fetch the generated blueprint. Does not retry — a 404 means "not generated yet". */
export const useSpec = (projectId?: string) =>
  useQuery({
    queryKey: specKey(projectId),
    queryFn: () => specService.get(projectId!).then((r) => r.data.data!.spec),
    enabled: !!projectId,
    retry: false,
  });

export const useGenerateSpec = (projectId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => specService.generate(projectId!),
    onSuccess: (res) => {
      qc.setQueryData(specKey(projectId), res.data.data!.spec);
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to generate the blueprint.');
    },
  });
};

/** Save user edits to the editable spec sections (FE5.5). */
export const useUpdateSpec = (projectId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: Partial<WorkflowSpec>) => specService.update(projectId!, updates),
    onSuccess: (res) => {
      qc.setQueryData(specKey(projectId), res.data.data!.spec);
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Could not save your change.');
    },
  });
};

/** Mark a risk reviewed / un-reviewed (FE5.8). */
export const useResolveRisk = (projectId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { riskId: string; resolved: boolean }) =>
      specService.resolveRisk(projectId!, vars.riskId, vars.resolved),
    onSuccess: (res) => {
      qc.setQueryData(specKey(projectId), res.data.data!.spec);
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Could not update that item.');
    },
  });
};

/** Tick / untick one approval-checklist item (FE5.10). */
export const useConfirmChecklistItem = (projectId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { key: string; confirmed: boolean }) =>
      specService.confirmChecklistItem(projectId!, vars.key, vars.confirmed),
    onSuccess: (res) => {
      qc.setQueryData(specKey(projectId), res.data.data!.spec);
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Could not update the checklist.');
    },
  });
};

export const useApplySuggestion = (projectId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { suggestionId: string; applied: boolean }) =>
      specService.applySuggestion(projectId!, vars.suggestionId, vars.applied),
    onSuccess: (res) => {
      qc.setQueryData(specKey(projectId), res.data.data!.spec);
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to update the blueprint.');
    },
  });
};

export const useApproveSpec = (projectId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => specService.approve(projectId!),
    onSuccess: (res) => {
      qc.setQueryData<WorkflowSpec>(specKey(projectId), res.data.data!.spec);
      toast.success('Blueprint approved!');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Could not approve — please resolve the flagged items.');
    },
  });
};
