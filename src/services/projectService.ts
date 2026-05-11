import axiosInstance from '../lib/axios';
import type { Project, CreateProjectDto, UpdateProjectDto } from '../types/project.types';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';

const projectService = {
  // GET all projects for logged-in user
  getProjects: (params?: { status?: string; domain?: string; page?: number; limit?: number }) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<Project>>>('/projects', { params }),

  // GET single project by ID
  getProject: (id: string) =>
    axiosInstance.get<ApiResponse<{ project: Project }>>(`/projects/${id}`),

  // POST create new project
  createProject: (data: CreateProjectDto) =>
    axiosInstance.post<ApiResponse<{ project: Project }>>('/projects', data),

  // PATCH update project
  updateProject: (id: string, data: UpdateProjectDto) =>
    axiosInstance.patch<ApiResponse<{ project: Project }>>(`/projects/${id}`, data),

  // DELETE project
  deleteProject: (id: string) =>
    axiosInstance.delete<ApiResponse<null>>(`/projects/${id}`),

  // PATCH duplicate project
  duplicateProject: (id: string) =>
    axiosInstance.post<ApiResponse<{ project: Project }>>(`/projects/${id}/duplicate`),

  // PATCH archive project
  archiveProject: (id: string) =>
    axiosInstance.patch<ApiResponse<{ project: Project }>>(`/projects/${id}/archive`),

  // PATCH restore archived project
  restoreProject: (id: string) =>
    axiosInstance.patch<ApiResponse<{ project: Project }>>(`/projects/${id}/restore`),

  // GET archived projects
  getArchivedProjects: () =>
    axiosInstance.get<ApiResponse<PaginatedResponse<Project>>>('/projects/archived'),
};

export default projectService;
