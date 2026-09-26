import axiosInstance from '../lib/axios';
import type { ApiResponse } from '../types/api.types';
import type { DeploymentInfo } from '../types/deployment.types';

type DeploymentResponse = ApiResponse<{ deployment: DeploymentInfo }>;

const filenameFromDisposition = (disposition?: string, fallback = 'project.zip'): string => {
  if (!disposition) return fallback;
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  return match?.[1] ?? fallback;
};

const deploymentService = {
  getDeployment: (projectId: string) =>
    axiosInstance.get<DeploymentResponse>(`/export/${projectId}`),

  recordLiveUrl: (projectId: string, url: string) =>
    axiosInstance.patch<DeploymentResponse>(`/export/${projectId}/live-url`, { url }),

  /** Download the generated project ZIP as a blob and trigger a browser save. */
  downloadZip: async (projectId: string) => {
    const res = await axiosInstance.get(`/export/${projectId}/zip`, { responseType: 'blob' });
    const filename = filenameFromDisposition(res.headers['content-disposition'] as string | undefined);
    const url = window.URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return filename;
  },
};

export default deploymentService;
