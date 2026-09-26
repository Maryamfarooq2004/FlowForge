import { StageContext } from './stage';
import { FileArtifact, StageResult, StageLog } from '../types';
import {
  renderDockerfile,
  renderDockerignore,
  renderLicense,
  renderRailwayJson,
  renderRenderYaml,
  renderDeployMd,
} from '../templates/bundler';

/**
 * Stage 6 — Deploy bundle. Emits the files that make the generated backend
 * deploy-ready (Dockerfile + Railway/Render config + LICENSE + instructions).
 * These land in the manifest, so they're browsable in Artifacts and included
 * in the exported ZIP.
 */
export const generateBundlerStage = ({ ir }: StageContext): StageResult => {
  const artifacts: FileArtifact[] = [
    { path: 'Dockerfile', contents: renderDockerfile() },
    { path: '.dockerignore', contents: renderDockerignore() },
    { path: 'LICENSE', contents: renderLicense(ir) },
    { path: 'railway.json', contents: renderRailwayJson() },
    { path: 'render.yaml', contents: renderRenderYaml(ir) },
    { path: 'DEPLOY.md', contents: renderDeployMd(ir) },
  ];
  const logs: StageLog[] = [
    { level: 'info', message: 'Bundling deploy config...' },
    { level: 'success', message: 'Emitted Dockerfile, Railway/Render config, LICENSE, and DEPLOY.md.' },
  ];
  return { artifacts, logs };
};
