import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import deploymentService from '../services/deploymentService';
import type { ApiError } from '../types/global.types';

const deploymentKey = (projectId?: string) => ['deployment', projectId];

export const useDeployment = (projectId?: string) =>
  useQuery({
    queryKey: deploymentKey(projectId),
    queryFn: () => deploymentService.getDeployment(projectId!).then((r) => r.data.data!.deployment),
    enabled: !!projectId,
    retry: false,
  });

export const useDownloadZip = (projectId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deploymentService.downloadZip(projectId!),
    onSuccess: () => {
      toast.success('Download started.');
      qc.invalidateQueries({ queryKey: deploymentKey(projectId) });
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Could not export the project.');
    },
  });
};

export const useRecordLiveUrl = (projectId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => deploymentService.recordLiveUrl(projectId!, url),
    onSuccess: (res) => {
      const deployment = res.data.data?.deployment;
      if (deployment) qc.setQueryData(deploymentKey(projectId), deployment);
      toast.success('Live URL saved — project marked Live.');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Could not save the URL.');
    },
  });
};
