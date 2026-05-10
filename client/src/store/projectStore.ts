import { create } from 'zustand';
import { mockProjects } from '../constants/mockData';

export type ProjectStatus = 'INTAKE' | 'SPEC_READY' | 'PREVIEW' | 'LIVE';

export interface Project {
  id: string;
  name: string;
  domain: 'clinic' | 'school';
  status: ProjectStatus;
  orgName: string;
  updatedAt: string;
}

interface ProjectStore {
  projects: Project[];
  activeProject: Project | null;
  setProjects: (projects: Project[]) => void;
  setActiveProject: (project: Project) => void;
  addProject: (project: Project) => void;
  updateProjectStatus: (id: string, status: ProjectStatus) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: mockProjects as Project[],
  activeProject: null,
  setProjects: (projects) => set({ projects }),
  setActiveProject: (project) => set({ activeProject: project }),
  addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
  updateProjectStatus: (id, status) => 
    set((state) => ({
      projects: state.projects.map((p) => p.id === id ? { ...p, status } : p)
    })),
}));
