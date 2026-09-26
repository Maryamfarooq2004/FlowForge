// Frontend mirror of the backend export DeploymentInfo (server/src/services/export.service.ts).
import type { GenerationStats } from './generation.types';

export type DeploymentStatus = 'none' | 'exported' | 'live';

export interface DeploymentInfo {
  appName: string;
  hasBuild: boolean;
  fileCount: number;
  stats: GenerationStats | null;
  status: DeploymentStatus;
  exportCount: number;
  lastExportAt?: string;
  liveUrl?: string;
}
