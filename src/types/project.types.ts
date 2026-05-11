export type ProjectStatus = 'INTAKE' | 'SPEC_READY' | 'PREVIEW' | 'LIVE';
export type ProjectDomain = 'clinic' | 'school';

export interface Project {
  id: string;           // MongoDB _id as string
  _id?: string;         // keep for backwards compatibility
  name: string;
  domain: ProjectDomain;
  status: ProjectStatus;
  userId: string;
  businessName?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  domain: ProjectDomain;
}

export interface UpdateProjectDto {
  name?: string;
  status?: ProjectStatus;
  description?: string;
}
