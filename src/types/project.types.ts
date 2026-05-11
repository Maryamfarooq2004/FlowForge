export type ProjectStatus = 'INTAKE' | 'SPEC_READY' | 'PREVIEW' | 'LIVE';
export type ProjectDomain = 'clinic' | 'school';
export type ProjectPhase =
  | 'domain' | 'intake_form' | 'guided_story' | 'guided_roles'
  | 'guided_data' | 'guided_rules' | 'intake_review' | 'documents'
  | 'theme' | 'blueprint' | 'alerts' | 'generating' | 'preview' | 'deployment';

export interface ProjectProgress {
  currentPhase: ProjectPhase;
  lastActiveScreen: string;
  completedSteps: string[];
}

export interface Project {
  id: string;
  _id?: string;
  name: string;
  domain: ProjectDomain;
  status: ProjectStatus;
  userId: string;
  businessName?: string;
  description?: string;
  isArchived: boolean;
  progress: ProjectProgress;
  createdAt: string;
  updatedAt: string;
}
