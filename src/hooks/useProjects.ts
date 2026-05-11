import {
  useQuery, useMutation, useQueryClient,
} from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import projectService from '../services/projectService';
import type { Project } from '../types/project.types';

export const projectKeys = {
  all:        ['projects'] as const,
  lists:      () => [...projectKeys.all, 'list'] as const,
  list:       (f?: object) => [...projectKeys.lists(), f] as const,
  archived:   () => [...projectKeys.all, 'archived'] as const,
  details:    () => [...projectKeys.all, 'detail'] as const,
  detail:     (id: string) => [...projectKeys.details(), id] as const,
  firstTime:  () => [...projectKeys.all, 'first-time'] as const,
};

// ── REAL PROJECTS FROM MONGODB ─────────────────────────────────
export const useProjects = (filters?: Record<string, any>) =>
  useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: async () => {
      const res = await projectService.getProjects(filters);
      return res.data.data;
    },
    select: (data) => ({
      projects: data?.items ?? [],
      pagination: data?.pagination,
    }),
  });

export const useArchivedProjects = () =>
  useQuery({
    queryKey: projectKeys.archived(),
    queryFn: async () => {
      const res = await projectService.getArchivedProjects();
      return res.data.data;
    },
    select: (data) => ({
      projects: data?.items ?? [],
    }),
  });

// ── FIRST TIME USER CHECK ──────────────────────────────────────
export const useIsFirstTimeUser = () =>
  useQuery({
    queryKey: projectKeys.firstTime(),
    queryFn: async () => {
      const res = await projectService.isFirstTimeUser();
      return res.data.data?.isFirstTime ?? true;
    },
    staleTime: 0, // Always fresh — check every time
  });

// ── SINGLE PROJECT ─────────────────────────────────────────────
export const useProject = (id: string | undefined) =>
  useQuery({
    queryKey: projectKeys.detail(id!),
    queryFn: async () => {
      const res = await projectService.getProject(id!);
      return res.data.data?.project;
    },
    enabled: !!id,
  });

// ── RESUME POINT ───────────────────────────────────────────────
export const useResumeProject = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectService.getResumePoint(projectId),
    onSuccess: (res) => {
      const { route, project } = res.data.data!;
      // Cache the project data before navigating
      queryClient.setQueryData(projectKeys.detail(project.id), project);
      navigate(route);
    },
    onError: () => {
      toast.error('Failed to open project. Please try again.');
    },
  });
};

// ── CREATE PROJECT (saves to MongoDB) ─────────────────────────
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: projectService.createProject,
    onSuccess: (res) => {
      const project = res.data.data?.project;
      if (!project) return;
      // Invalidate projects list so hub shows new project
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.firstTime() });
      toast.success('Project created!');
      // Navigate to intake form with REAL project ID from MongoDB
      navigate(`/project/${project.id}/intake/form`);
    },
    onError: (err: any) => {
      const code = err.response?.data?.code;
      if (code === 'DUPLICATE_NAME') {
        return { error: 'You already have a project with this name.' };
      }
      toast.error(err.response?.data?.message || 'Failed to create project.');
    },
  });
};

// ── UPDATE PROGRESS ────────────────────────────────────────────
export const useUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId, phase, lastActiveScreen, completedStep
    }: {
      projectId: string;
      phase: string;
      lastActiveScreen: string;
      completedStep?: string;
    }) => projectService.updateProgress(projectId, {
      phase, lastActiveScreen, completedStep
    }),
    onSuccess: (res, variables) => {
      queryClient.setQueryData(
        projectKeys.detail(variables.projectId),
        res.data.data?.project
      );
    },
  });
};

// ── ARCHIVE ────────────────────────────────────────────────────
export const useArchiveProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectService.archiveProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success('Project archived.');
    },
  });
};

// ── DUPLICATE ──────────────────────────────────────────────────
export const useDuplicateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectService.duplicateProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success('Project duplicated!');
    },
  });
};

// ── DELETE ─────────────────────────────────────────────────────
export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success('Project deleted.');
    },
  });
};

// ── RESTORE ────────────────────────────────────────────────────
export const useRestoreProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectService.restoreProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success('Project restored to hub.');
    },
  });
};
