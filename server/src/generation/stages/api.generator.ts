import { StageContext } from './stage';
import { FileArtifact, StageResult, StageLog } from '../types';
import {
  renderValidator,
  renderService,
  renderController,
  renderRoutes,
  renderRouteIndex,
} from '../templates/entityApi';
import * as scaffold from '../templates/scaffold';
import {
  renderNotificationService,
  renderNotificationController,
  renderNotificationRoutes,
  renderNotificationConfig,
} from '../templates/notifications';

/**
 * Stage 3 — the Express app scaffold, auth, and CRUD API for every
 * non-workflow entity (the workflow entity's API is emitted in Stage 4).
 */
export const generateApiStage = ({ ir, rulePlan }: StageContext): StageResult => {
  const artifacts: FileArtifact[] = [];
  const logs: StageLog[] = [];

  // App scaffold + shared infrastructure.
  artifacts.push(
    { path: 'package.json', contents: scaffold.renderPackageJson(ir) },
    { path: 'tsconfig.json', contents: scaffold.renderTsconfig() },
    { path: '.env.example', contents: scaffold.renderEnvExample(ir) },
    { path: '.gitignore', contents: scaffold.renderGitignore() },
    { path: 'docker-compose.yml', contents: scaffold.renderDockerCompose(ir) },
    { path: 'README.md', contents: scaffold.renderReadme(ir) },
    { path: 'src/app.ts', contents: scaffold.renderAppTs() },
    { path: 'src/server.ts', contents: scaffold.renderServerTs() },
    { path: 'src/utils/AppError.ts', contents: scaffold.renderAppError() },
    { path: 'src/utils/response.util.ts', contents: scaffold.renderResponseUtil() },
    { path: 'src/middleware/auth.middleware.ts', contents: scaffold.renderAuthMiddleware() },
    { path: 'src/middleware/validate.middleware.ts', contents: scaffold.renderValidateMiddleware() },
    { path: 'src/middleware/error.middleware.ts', contents: scaffold.renderErrorMiddleware() },
    { path: 'src/services/auth.service.ts', contents: scaffold.renderAuthService() },
    { path: 'src/controllers/auth.controller.ts', contents: scaffold.renderAuthController() },
    { path: 'src/routes/auth.routes.ts', contents: scaffold.renderAuthRoutes() }
  );
  logs.push({ level: 'info', message: 'Scaffolding Express app + JWT auth...' });

  // Validators for all entities (transition-agnostic).
  for (const e of ir.entities) {
    artifacts.push({ path: `src/validators/${e.varName}.validator.ts`, contents: renderValidator(e) });
  }

  // CRUD API for non-workflow entities.
  const nonWf = ir.entities.filter((e) => !e.isWorkflow);
  for (const e of nonWf) {
    artifacts.push(
      { path: `src/services/${e.varName}.service.ts`, contents: renderService(e, ir, rulePlan) },
      { path: `src/controllers/${e.varName}.controller.ts`, contents: renderController(e, ir) },
      { path: `src/routes/${e.varName}.routes.ts`, contents: renderRoutes(e, ir, rulePlan) }
    );
    logs.push({ level: 'info', message: `CRUD API for ${e.modelName} (/api/${e.routeBase})` });
  }

  // In-app notifications API + configured alert triggers.
  artifacts.push(
    { path: 'src/services/notification.service.ts', contents: renderNotificationService() },
    { path: 'src/controllers/notification.controller.ts', contents: renderNotificationController() },
    { path: 'src/routes/notification.routes.ts', contents: renderNotificationRoutes() },
    { path: 'src/config/notifications.ts', contents: renderNotificationConfig(ir) }
  );

  artifacts.push({ path: 'src/routes/index.ts', contents: renderRouteIndex(ir) });

  logs.push({
    level: 'success',
    message: `REST API generated for ${nonWf.length} collection(s), JWT-protected + validated.`,
  });
  logs.push({ level: 'info', message: 'In-app notifications API generated (/api/notifications).' });
  return { artifacts, logs };
};
