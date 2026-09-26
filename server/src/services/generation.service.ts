import { GenerationRun, IGenerationRun } from '../models/GenerationRun.model';
import { WorkflowSpec } from '../models/WorkflowSpec.model';
import { NotificationConfig } from '../models/NotificationConfig.model';
import { Project } from '../models/Project.model';
import { AppError } from '../utils/AppError';
import { runGeneration } from '../generation/CodeGenerationService';
import { SpecInput, SpecInputTrigger } from '../generation/ir/buildIR';
import { getPreviewTheme } from './theme.service';

const assertProject = async (userId: string, projectId: string) => {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) throw new AppError('Project not found.', 404, 'NOT_FOUND');
  return project;
};

// ── Stale-run cleanup ─────────────────────────────────────────────────────
// Generation runs DETACHED and in-process. If the process dies mid-run (crash,
// deploy, dev restart) the run is left stuck at 'running' forever with nothing
// to finish it. Two safeguards mark those zombies 'failed':
//   1. reapStaleRunsOnBoot() — on startup, every in-flight run belongs to a dead
//      process, so fail them all.
//   2. healIfStale() — on read, a run untouched past STALE_MS (a generation
//      finishes in seconds; progress is persisted every stage) is dead, so the
//      polling page sees 'failed' instead of spinning forever.
const STALE_MS = Number(process.env.GENERATION_STALE_MS) || 3 * 60 * 1000;
const STALE_ERROR =
  'Generation was interrupted (server restart or timeout) and did not finish. Please start a new generation.';

/** Fail any in-flight runs left over from a previous process. Call once on boot. */
export const reapStaleRunsOnBoot = async (): Promise<number> => {
  const res = await GenerationRun.updateMany(
    { status: { $in: ['queued', 'running'] } },
    { $set: { status: 'failed', error: STALE_ERROR, finishedAt: new Date() } }
  );
  return res.modifiedCount ?? 0;
};

/** If a run is stuck in-flight past STALE_MS, mark it failed and return the fresh doc. */
const healIfStale = async (run: IGenerationRun): Promise<IGenerationRun> => {
  if (run.status !== 'running' && run.status !== 'queued') return run;
  const last = (run.updatedAt ?? run.createdAt)?.getTime?.() ?? 0;
  if (Date.now() - last <= STALE_MS) return run;
  const updated = await GenerationRun.findByIdAndUpdate(
    run._id,
    { $set: { status: 'failed', error: STALE_ERROR, finishedAt: new Date() } },
    { new: true }
  );
  return updated ?? run;
};

/**
 * Create a GenerationRun for an approved spec and kick the pipeline off
 * DETACHED. Returns immediately (the controller responds 202); the run doc is
 * then polled for progress.
 */
export const startGenerationService = async (userId: string, projectId: string) => {
  const project = await assertProject(userId, projectId);

  const spec = await WorkflowSpec.findOne({ projectId, userId });
  if (!spec) throw new AppError('Blueprint not generated yet.', 404, 'SPEC_NOT_FOUND');
  if (spec.status !== 'approved') {
    throw new AppError('Approve the blueprint before generating code.', 400, 'SPEC_NOT_APPROVED');
  }

  const run = await GenerationRun.create({
    projectId,
    userId,
    specId: spec._id,
    specVersion: spec.version,
    domain: spec.domain,
    status: 'queued',
    stage: 0,
    stageName: 'Queued',
    percent: 0,
    logs: [],
    artifacts: [],
  });

  await Project.findByIdAndUpdate(projectId, {
    'progress.currentPhase': 'generating',
    'progress.lastActiveScreen': `/project/${projectId}/generating`,
  });

  // Configured alert triggers (Set Up Alerts) feed the generated app; fall back
  // to the spec's default triggers if the user never opened the alerts screen.
  const alertConfig = await NotificationConfig.findOne({ projectId, userId }).lean();
  const notificationTriggers: SpecInputTrigger[] = alertConfig
    ? alertConfig.triggers.map((t) => ({ event: t.event, channel: t.channel, description: t.description, enabled: t.enabled }))
    : spec.notificationTriggers.map((t) => ({ event: t.event, channel: t.channel, description: t.description, enabled: true }));

  // The project's saved theme (or domain default) feeds the emitted frontend.
  const previewTheme = await getPreviewTheme(userId, projectId, spec.domain);

  const specInput: SpecInput = {
    domain: spec.domain,
    entities: spec.entities,
    roles: spec.roles,
    states: spec.states,
    transitions: spec.transitions,
    businessRules: spec.businessRules,
    notificationTriggers,
    theme: { colors: previewTheme.brand, fonts: previewTheme.fonts },
  };

  // Fire-and-forget — errors are captured inside runGeneration and marked on the run.
  void runGeneration(String(run._id), specInput, project.name, String(projectId));

  return run;
};

/** Latest run for a project (for polling / resuming the progress page). */
export const getLatestRunService = async (userId: string, projectId: string) => {
  await assertProject(userId, projectId);
  const run = await GenerationRun.findOne({ projectId, userId }).sort({ createdAt: -1 });
  if (!run) throw new AppError('No generation run found for this project.', 404, 'RUN_NOT_FOUND');
  return healIfStale(run);
};

/** A specific run by id (used by the logs/artifacts pages). */
export const getRunService = async (userId: string, runId: string) => {
  const run = await GenerationRun.findOne({ _id: runId, userId });
  if (!run) throw new AppError('Generation run not found.', 404, 'RUN_NOT_FOUND');
  return healIfStale(run);
};
