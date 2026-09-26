import { StageContext } from './stage';
import { FileArtifact, StageResult, StageLog } from '../types';
import { renderModel, renderModelIndex } from '../templates/model';
import { renderMigration, renderUsersMigration, migrationFileName } from '../templates/migration';
import { renderNotificationModel, renderNotificationsMigration } from '../templates/notifications';
import {
  renderDatabaseConfig,
  renderUserModel,
  renderSequelizerc,
  renderSequelizeCliConfig,
} from '../templates/scaffold';

/** Stage 2 — Sequelize TS models, association registry, and numbered migrations. */
export const generateOrmStage = ({ ir }: StageContext): StageResult => {
  const artifacts: FileArtifact[] = [];
  const logs: StageLog[] = [];

  artifacts.push({ path: 'src/config/database.ts', contents: renderDatabaseConfig(ir) });
  artifacts.push({ path: 'src/models/User.model.ts', contents: renderUserModel() });

  for (const e of ir.entities) {
    artifacts.push({ path: `src/models/${e.modelName}.model.ts`, contents: renderModel(e, ir) });
    logs.push({ level: 'info', message: `Model ${e.modelName} generated.` });
  }
  // In-app notifications infrastructure (see templates/notifications.ts).
  artifacts.push({ path: 'src/models/Notification.model.ts', contents: renderNotificationModel() });
  artifacts.push({ path: 'src/models/index.ts', contents: renderModelIndex(ir) });

  // Migrations in strict dependency (topological) order — users first.
  artifacts.push({
    path: `migrations/${migrationFileName(0, 'users')}`,
    contents: renderUsersMigration(ir),
  });
  ir.entities.forEach((e, i) => {
    artifacts.push({
      path: `migrations/${migrationFileName(i + 1, e.tableName)}`,
      contents: renderMigration(e, ir),
    });
  });
  // Notifications table last (no FKs → any order is safe).
  artifacts.push({
    path: `migrations/${migrationFileName(ir.entities.length + 1, 'notifications')}`,
    contents: renderNotificationsMigration(),
  });

  artifacts.push({ path: '.sequelizerc', contents: renderSequelizerc() });
  artifacts.push({ path: 'config/sequelize.js', contents: renderSequelizeCliConfig(ir) });

  logs.push({
    level: 'success',
    message: `Sequelize models + ${ir.entities.length + 1} migrations created (dependency-ordered).`,
  });
  return { artifacts, logs };
};
