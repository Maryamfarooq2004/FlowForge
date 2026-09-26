import axiosInstance from '../lib/axios';
import type { ApiResponse } from '../types/api.types';
import type { DocumentDTO, DocumentItems } from '../types/document.types';

type ListResponse = ApiResponse<{ documents: DocumentDTO[] }>;
type MergeResponse = ApiResponse<{ documentItems: DocumentItems }>;

const documentsService = {
  list: (projectId: string) => axiosInstance.get<ListResponse>(`/documents/${projectId}`),

  upload: (projectId: string, files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append('documents', f));
    return axiosInstance.post<ListResponse>(`/documents/${projectId}/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  remove: (projectId: string, docId: string) =>
    axiosInstance.delete<ApiResponse<{ deleted: boolean }>>(`/documents/${projectId}/${docId}`),

  merge: (projectId: string, items: DocumentItems) =>
    axiosInstance.post<MergeResponse>(`/documents/${projectId}/merge`, items),
};

export default documentsService;
