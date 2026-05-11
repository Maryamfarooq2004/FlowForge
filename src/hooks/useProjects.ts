import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import projectService from '../services/projectService';
import type { Project, CreateProjectDto, UpdateProjectDto } from '../types/project.types';
import type { ApiError } from '../types/global.types';

// Query key factory — keeps all cache keys consistent
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters?: object) => [...projectKeys.lists(), filters] as const,
  archived: () => [...projectKeys.all, 'archived'] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

// ── GET ALL PROJECTS ──────────────────────────────────────────

export const useProjects = (filters?: {
  status?: string;
  domain?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: async () => {
      const response = await projectService.getProjects(filters);
      return response.data.data;
    },
    select: (data) => ({
      projects: data?.items ?? [],
      pagination: data?.pagination,
    }),
  });
};

// ── GET SINGLE PROJECT ────────────────────────────────────────

export const useProject = (id: string | undefined) => {
  return useQuery({
    queryKey: projectKeys.detail(id!),
    queryFn: async () => {
      const response = await projectService.getProject(id!);
      return response.data.data?.project;
    },
    enabled: !!id,  // Only run if ID exists
  });
};

// ── GET ARCHIVED PROJECTS ─────────────────────────────────────

export const useArchivedProjects = () => {
  return useQuery({
    queryKey: projectKeys.archived(),
    queryFn: async () => {
      const response = await projectService.getArchivedProjects();
      return response.data.data?.items ?? [];
    },
  });
};

// ── CREATE PROJECT ────────────────────────────────────────────

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectDto) => projectService.createProject(data),
    onSuccess: (response) => {
      const newProject = response.data.data?.project;
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success('Project created successfully!');
      return newProject;
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || 'Failed to create project.';
      toast.error(message);
    },
  });
};

// ── UPDATE PROJECT ────────────────────────────────────────────

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectDto }) =>
      projectService.updateProject(id, data),
    onSuccess: (response, variables) => {
      const updatedProject = response.data.data?.project;
      // Update specific project in cache
      queryClient.setQueryData(
        projectKeys.detail(variables.id),
        updatedProject
      );
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to update project.');
    },
  });
};

// ── DELETE PROJECT ────────────────────────────────────────────

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });
      // Snapshot current data for rollback
      const previousProjects = queryClient.getQueryData(projectKeys.lists());
      // Optimistically remove from cache
      queryClient.setQueriesData(
        { queryKey: projectKeys.lists() },
        (old: any) => ({
          ...old,
          projects: old?.projects?.filter((p: Project) => p.id !== id) ?? [],
        })
      );
      return { previousProjects };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success('Project deleted.');
    },
    onError: (error: ApiError, _id, context) => {
      // Rollback optimistic update
      if (context?.previousProjects) {
        queryClient.setQueryData(projectKeys.lists(), context.previousProjects);
      }
      toast.error(error.response?.data?.message || 'Failed to delete project.');
    },
  });
};

// ── DUPLICATE PROJECT ─────────────────────────────────────────

export const useDuplicateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.duplicateProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success('Project duplicated successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to duplicate project.');
    },
  });
};

// ── ARCHIVE PROJECT ───────────────────────────────────────────

export const useArchiveProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.archiveProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success('Project archived.');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to archive project.');
    },
  });
};
