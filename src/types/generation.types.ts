// Frontend mirror of the backend GenerationRun (server/src/models/GenerationRun.model.ts).

export type GenerationStatus = 'queued' | 'running' | 'completed' | 'failed';
export type GenerationLogLevel = 'info' | 'success' | 'warning' | 'error';

export interface GenerationLog {
  level: GenerationLogLevel;
  time: string;
  message: string;
}

export interface GenerationArtifact {
  path: string;
  lang: string;
  size: number;
  contents: string;
}

export interface GenerationStats {
  files: number;
  entities: number;
  endpoints: number;
  durationMs: number;
}

export interface GenerationRun {
  id: string;
  projectId: string;
  specId: string;
  specVersion: number;
  domain: 'clinic' | 'school';
  status: GenerationStatus;
  stage: number;
  stageName: string;
  percent: number;
  logs: GenerationLog[];
  artifacts: GenerationArtifact[];
  stats: GenerationStats;
  workspacePath: string;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const isTerminal = (status?: GenerationStatus): boolean =>
  status === 'completed' || status === 'failed';
