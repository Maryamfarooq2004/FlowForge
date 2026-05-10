import axiosInstance from '../lib/axios';

export interface Project {
  _id: string;
  name: string;
  organizationName?: string;
  category: 'clinic' | 'school';
  status: 'intake' | 'spec_ready' | 'preview' | 'live' | 'archived' | 'generating' | 'extraction_failed';
  stagingUrl?: string;
  liveUrl?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

const projectService = {
  getAll: async (): Promise<Project[]> => {
    const response = await axiosInstance.get('/projects');
    return response.data.data;
  },

  getArchived: async (): Promise<Project[]> => {
    const response = await axiosInstance.get('/projects/archived');
    return response.data.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await axiosInstance.get(`/projects/${id}`);
    return response.data.data;
  },

  create: async (data: { name: string; category: string; organizationName?: string }): Promise<Project> => {
    const response = await axiosInstance.post('/projects', data);
    return response.data.data;
  },

  archive: async (id: string): Promise<Project> => {
    const response = await axiosInstance.patch(`/projects/${id}/archive`);
    return response.data.data;
  },

  restore: async (id: string): Promise<Project> => {
    const response = await axiosInstance.patch(`/projects/${id}/restore`);
    return response.data.data;
  },

  duplicate: async (id: string): Promise<Project> => {
    const response = await axiosInstance.post(`/projects/${id}/duplicate`);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/projects/${id}`);
  },

  updateStatus: async (id: string, status: string): Promise<Project> => {
    const response = await axiosInstance.patch(`/projects/${id}`, { status });
    return response.data.data;
  }
};

export default projectService;
