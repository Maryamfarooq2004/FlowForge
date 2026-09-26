import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import documentsService from '../services/documentsService';
import type { DocumentDTO, DocumentItems } from '../types/document.types';
import type { ApiError } from '../types/global.types';

const docsKey = (projectId?: string) => ['documents', projectId];

export const useDocuments = (projectId?: string) =>
  useQuery<DocumentDTO[]>({
    queryKey: docsKey(projectId),
    queryFn: () => documentsService.list(projectId!).then((r) => r.data.data!.documents),
    enabled: !!projectId,
    retry: false,
  });

export const useUploadDocuments = (projectId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => documentsService.upload(projectId!, files),
    onSuccess: (res) => {
      const docs = res.data.data?.documents ?? [];
      const failed = docs.filter((d) => d.status === 'failed').length;
      qc.invalidateQueries({ queryKey: docsKey(projectId) });
      if (failed) toast.error(`${failed} file(s) could not be parsed.`);
      else toast.success(`${docs.length} document(s) analyzed.`);
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Upload failed.');
    },
  });
};

export const useDeleteDocument = (projectId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) => documentsService.remove(projectId!, docId),
    onSuccess: () => qc.invalidateQueries({ queryKey: docsKey(projectId) }),
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Could not remove the document.');
    },
  });
};

export const useMergeDocuments = (projectId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: DocumentItems) => documentsService.merge(projectId!, items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: docsKey(projectId) });
      toast.success('Merged into your intake.');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Could not merge.');
    },
  });
};
