import { StageContext } from './stage';
import { FileArtifact, StageResult, StageLog } from '../types';
import * as scaffold from '../templates/frontend/scaffold';
import * as runtime from '../templates/frontend/runtime';
import * as pages from '../templates/frontend/pages';
import { renderAppTsx } from '../templates/frontend/app';

/**
 * Stage 6 — Frontend Generator. Emits a real React + Vite + TypeScript SPA under
 * `client/` (auth + layout + dashboard + per-entity List/Form/Detail with
 * workflow transitions), branded from the IR's ThemeConfig. Talks to the
 * generated backend's REST API.
 */
export const generateFrontendStage = ({ ir }: StageContext): StageResult => {
  const artifacts: FileArtifact[] = [
    // Scaffold + config
    { path: 'client/package.json', contents: scaffold.renderClientPackageJson(ir) },
    { path: 'client/tsconfig.json', contents: scaffold.renderClientTsconfig() },
    { path: 'client/vite.config.ts', contents: scaffold.renderViteConfig() },
    { path: 'client/index.html', contents: scaffold.renderIndexHtml(ir) },
    { path: 'client/.env.example', contents: scaffold.renderClientEnvExample() },
    { path: 'client/.gitignore', contents: 'node_modules\ndist\n.env\n*.log\n' },
    { path: 'client/Dockerfile', contents: scaffold.renderClientDockerfile() },
    { path: 'client/nginx.conf', contents: scaffold.renderClientNginxConf() },
    { path: 'client/.dockerignore', contents: 'node_modules\ndist\n.env\n*.log\n.git\n' },
    // App source
    { path: 'client/src/env.d.ts', contents: scaffold.renderEnvDts() },
    { path: 'client/src/main.tsx', contents: scaffold.renderMainTsx() },
    { path: 'client/src/theme.css', contents: scaffold.renderThemeCss(ir) },
    { path: 'client/src/App.tsx', contents: renderAppTsx(ir) },
    { path: 'client/src/api/client.ts', contents: scaffold.renderApiClient() },
    { path: 'client/src/auth/session.ts', contents: scaffold.renderSession() },
    { path: 'client/src/auth/ProtectedRoute.tsx', contents: scaffold.renderProtectedRoute() },
    { path: 'client/src/auth/LoginPage.tsx', contents: pages.renderLoginPage(ir) },
    { path: 'client/src/lib/meta.ts', contents: runtime.renderMetaTs(ir) },
    { path: 'client/src/lib/format.ts', contents: runtime.renderFormatTs() },
    { path: 'client/src/components/StateBadge.tsx', contents: runtime.renderStateBadgeTsx() },
    { path: 'client/src/components/DataTable.tsx', contents: runtime.renderDataTableTsx() },
    { path: 'client/src/components/Layout.tsx', contents: runtime.renderLayoutTsx(ir) },
    { path: 'client/src/pages/DashboardPage.tsx', contents: pages.renderDashboardPage() },
  ];

  // Per-entity List / Form / Detail screens.
  for (const e of ir.entities) {
    artifacts.push(
      { path: `client/src/pages/${e.varName}/${e.modelName}ListPage.tsx`, contents: pages.renderEntityListPage(e) },
      { path: `client/src/pages/${e.varName}/${e.modelName}FormPage.tsx`, contents: pages.renderEntityFormPage(e) },
      { path: `client/src/pages/${e.varName}/${e.modelName}DetailPage.tsx`, contents: pages.renderEntityDetailPage(e) }
    );
  }

  const logs: StageLog[] = [
    { level: 'info', message: 'Generating React frontend (Vite + TypeScript)...' },
    {
      level: 'success',
      message: `Frontend generated: ${ir.entities.length} collection(s) × list/form/detail + dashboard + auth, theme-branded.`,
    },
  ];
  return { artifacts, logs };
};
