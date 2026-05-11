import axiosInstance from '../lib/axios';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';
import type { Project } from '../types/project.types';

const projectService = {
  // Real data from MongoDB for logged-in user
  getProjects: (params?: Record<string, any>) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<Project>>>(
      '/projects', { params }
    ),

  // Check if this is the user's first time (no projects)
  isFirstTimeUser: () =>
    axiosInstance.get<ApiResponse<{ isFirstTime: boolean }>>(
      '/projects/first-time-check'
    ),

  // Get single project
  getProject: (id: string) =>
    axiosInstance.get<ApiResponse<{ project: Project }>>(`/projects/${id}`),

  // Get resume point — returns exact route + loaded project data
  getResumePoint: (id: string) =>
    axiosInstance.get<ApiResponse<{
      route: string;
      phase: string;
      project: Project;
    }>>(`/projects/${id}/resume`),

  // Create — saves to MongoDB, returns real _id
  createProject: (data: { name: string; domain: 'clinic' | 'school' }) =>
    axiosInstance.post<ApiResponse<{ project: Project }>>('/projects', data),

  // Update progress tracking
  updateProgress: (id: string, data: {
    phase: string;
    lastActiveScreen: string;
    completedStep?: string;
  }) =>
    axiosInstance.patch<ApiResponse<{ project: Project }>>(
      `/projects/${id}/progress`, data
    ),

  archiveProject:   (id: string) =>
    axiosInstance.patch(`/projects/${id}/archive`),

  duplicateProject: (id: string) =>
    axiosInstance.post(`/projects/${id}/duplicate`),

  deleteProject:    (id: string) =>
    axiosInstance.delete(`/projects/${id}`),

  getArchivedProjects: () =>
    axiosInstance.get<ApiResponse<{ items: Project[] }>>('/projects/archived'),
};

export default projectService;
