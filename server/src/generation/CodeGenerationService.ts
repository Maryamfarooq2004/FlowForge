import fs from 'fs/promises';
import path from 'path';
import { GenerationRun, GenerationLog, GenerationArtifact } from '../models/GenerationRun.model';
import { Project } from '../models/Project.model';
import { buildContext } from './generate';
import { SpecInput } from './ir/buildIR';
import { STAGES } from './stages';
import { FileArtifact, StageLog } from './types';
import { notifyProjectOwner } from '../services/notification.service';

/** Root directory for on-disk generated workspaces (kept for Phase 5 export). */
export const WORKSPACES_DIR =
  process.env.GENERATION_WORKSPACE_DIR || path.join(process.cwd(), 'generated-workspaces');

// Modest per-stage pacing so the progress page tells the real build story.
// Overridable via env; set to 0 in fast/CI contexts.
const STAGE_DELAY_MS = Number(process.env.GENERATION_STAGE_DELAY_MS ?? 700);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const nowIso = () => new Date().toISOString();

const langOf = (filePath: string): string => {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    ts: 'ts', tsx: 'tsx', js: 'js', json: 'json', sql: 'sql',
    md: 'md', yml: 'yaml', yaml: 'yaml', example: 'text',
  };
  return map[ext] ?? 'text';
};

const toManifest = (artifacts: FileArtifact[]): GenerationArtifact[] =>
  artifacts.map((a) => ({
    path: a.path,
    lang: langOf(a.path),
    size: Buffer.byteLength(a.contents, 'utf8'),
    contents: a.contents,
  }));

const writeToDisk = async (workspace: string, artifacts: FileArtifact[]) => {
  for (const a of artifacts) {
    const full = path.join(workspace, a.path);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, a.contents, 'utf8');
  }
};

/**
 * Execute the deterministic 6-stage backend pipeline for one GenerationRun,
 * streaming progress + logs into the run document. Designed to run DETACHED
 * (not awaited by the HTTP request). Any failure marks the run 'failed'.
 */
export const runGeneration = async (
  runId: string,
  spec: SpecInput,
  projectName: string,
  projectId: string
): Promise<void> => {
  const startMs = Date.now();
  const logs: GenerationLog[] = [];
  const artifactsByPath = new Map<string, string>();

  const pushLog = (l: StageLog) => logs.push({ level: l.level, time: nowIso(), message: l.message });

  const persist = (patch: Record<string, unknown>) =>
    GenerationRun.findByIdAndUpdate(runId, { $set: patch });

  try {
    const ctx = buildContext(spec, projectName);

    pushLog({ level: 'info', message: 'Build pipeline initialized.' });
    await persist({ status: 'running', stage: 0, stageName: 'Initializing', percent: 2, startedAt: new Date(), logs });
    void notifyProjectOwner(projectId, 'GENERATION_STARTED');
    await sleep(Math.min(STAGE_DELAY_MS, 400));

    for (const stage of STAGES) {
      const result = stage.run(ctx);
      for (const a of result.artifacts) artifactsByPath.set(a.path, a.contents);
      result.logs.forEach(pushLog);

      await persist({
        stage: stage.index,
        stageName: stage.name,
        percent: stage.percentEnd,
        logs,
      });
      await sleep(STAGE_DELAY_MS);
    }

    // Finalize: assemble the manifest, write the disk workspace, compute stats.
    pushLog({ level: 'info', message: 'Packaging generated full-stack app...' });
    const artifacts: FileArtifact[] = [...artifactsByPath.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([p, contents]) => ({ path: p, contents }));

    const workspace = path.join(WORKSPACES_DIR, runId);
    await writeToDisk(workspace, artifacts).catch((err) => {
      // Disk is best-effort (ephemeral on Railway); the Mongo manifest is canonical.
      pushLog({ level: 'warning', message: `Workspace not persisted to disk: ${String(err?.message || err)}` });
    });

    const entities = ctx.ir.entities.length;
    const hasWorkflow = ctx.ir.entities.some((e) => e.isWorkflow) && !!ctx.ir.workflow;
    const endpoints = entities * 5 + (hasWorkflow ? 1 : 0) + 4; // CRUD + transition + auth(2) + notifications(2)
    const stats = { files: artifacts.length, entities, endpoints, durationMs: Date.now() - startMs };

    pushLog({ level: 'success', message: `Backend generated: ${artifacts.length} files, ${endpoints} endpoints.` });

    await persist({
      status: 'completed',
      stage: 8,
      stageName: 'Completed',
      percent: 100,
      logs,
      artifacts: toManifest(artifacts),
      workspacePath: workspace,
      stats,
      finishedAt: new Date(),
    });

    await Project.findByIdAndUpdate(projectId, {
      status: 'PREVIEW',
      'progress.currentPhase': 'preview',
      'progress.lastActiveScreen': `/project/${projectId}/artifacts`,
      $addToSet: { 'progress.completedSteps': 'generating' },
    });

    void notifyProjectOwner(projectId, 'GENERATION_COMPLETED', { meta: { runId, files: artifacts.length, endpoints } });
  } catch (err: any) {
    pushLog({ level: 'error' as any, message: `Generation failed: ${String(err?.message || err)}` });
    await persist({
      status: 'failed',
      error: String(err?.message || err),
      logs,
      finishedAt: new Date(),
    }).catch(() => undefined);

    void notifyProjectOwner(projectId, 'GENERATION_FAILED', { meta: { runId, error: String(err?.message || err) } });
  }
};
