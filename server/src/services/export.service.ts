import { GenerationRun, IGenerationRun, GenerationArtifact, GenerationStats } from '../models/GenerationRun.model';
import { Project } from '../models/Project.model';
import { DeploymentRecord, DeploymentStatus } from '../models/DeploymentRecord.model';
import { AppError } from '../utils/AppError';
import { notifyProjectOwner } from './notification.service';

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

export interface ZipEntry {
  name: string;
  contents: string;
}

/** Filesystem-safe slug used as the ZIP's root folder + filename. */
export const slugify = (name: string): string =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'app';

/** Pure: map a run's manifest to zip entries, each under a `<slug>/` root folder. */
export const zipEntries = (run: Pick<IGenerationRun, 'artifacts'>, appSlug: string): ZipEntry[] =>
  (run.artifacts as GenerationArtifact[]).map((a) => ({ name: `${appSlug}/${a.path}`, contents: a.contents }));

const assertProject = async (userId: string, projectId: string) => {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) throw new AppError('Project not found.', 404, 'NOT_FOUND');
  return project;
};

const ensureRecord = (userId: string, projectId: string) =>
  DeploymentRecord.findOneAndUpdate(
    { projectId, userId },
    { $setOnInsert: { status: 'none', exportCount: 0 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

/** Latest COMPLETED run for the project (the exportable manifest). */
export const getLatestCompletedRun = async (userId: string, projectId: string) => {
  const project = await assertProject(userId, projectId);
  const run = await GenerationRun.findOne({ projectId, userId, status: 'completed' }).sort({ createdAt: -1 });
  if (!run) throw new AppError('No completed build to export. Generate the app first.', 404, 'NO_BUILD');
  return { run, project };
};

export const getDeploymentService = async (userId: string, projectId: string): Promise<DeploymentInfo> => {
  const project = await assertProject(userId, projectId);
  const run = await GenerationRun.findOne({ projectId, userId, status: 'completed' }).sort({ createdAt: -1 });
  const rec = await ensureRecord(userId, projectId);
  return {
    appName: project.name,
    hasBuild: !!run,
    fileCount: run ? (run.artifacts as GenerationArtifact[]).length : 0,
    stats: (run?.stats as GenerationStats) ?? null,
    status: rec!.status,
    exportCount: rec!.exportCount,
    lastExportAt: rec!.lastExportAt ? rec!.lastExportAt.toISOString() : undefined,
    liveUrl: rec!.liveUrl,
  };
};

/** Fire-and-forget bump after a successful ZIP stream. */
export const recordExportService = (userId: string, projectId: string) =>
  DeploymentRecord.findOneAndUpdate(
    { projectId, userId },
    { $inc: { exportCount: 1 }, $set: { lastExportAt: new Date() } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )
    .then((rec) => {
      // Don't downgrade a 'live' project to 'exported'.
      if (rec && rec.status === 'none') {
        rec.status = 'exported';
        // First export of this project — worth a one-time notification.
        void notifyProjectOwner(projectId, 'EXPORT_READY');
        return rec.save();
      }
      return rec;
    })
    .catch(() => undefined);

/** Record a user-supplied live URL and flip the project to LIVE. */
export const recordLiveUrlService = async (userId: string, projectId: string, url: string): Promise<DeploymentInfo> => {
  await assertProject(userId, projectId);
  if (!url || !/^https?:\/\/.+/i.test(url.trim())) {
    throw new AppError('Enter a valid URL starting with http:// or https://.', 400, 'VALIDATION_ERROR');
  }
  await DeploymentRecord.findOneAndUpdate(
    { projectId, userId },
    { $set: { liveUrl: url.trim(), status: 'live' } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  await Project.findByIdAndUpdate(projectId, {
    status: 'LIVE',
    'progress.currentPhase': 'deployment',
    'progress.lastActiveScreen': `/project/${projectId}/deploy`,
    $addToSet: { 'progress.completedSteps': 'deployment' },
  });
  void notifyProjectOwner(projectId, 'DEPLOY_LIVE');
  return getDeploymentService(userId, projectId);
};
