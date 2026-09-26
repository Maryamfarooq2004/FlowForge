import { IR } from '../types';
import { banner, lines, withTrailingNewline } from './helpers';

/**
 * Generated-app notification subsystem (in-app). Emits a `notifications` table,
 * a Sequelize model, a `notify()` helper called on every workflow transition,
 * and a small read/mark-read API. The configured alert triggers (from the
 * WorkflowSpec / Set Up Alerts) are emitted as data in `config/notifications.ts`.
 */

// ── src/models/Notification.model.ts ───────────────────────────────
export const renderNotificationModel = (): string =>
  withTrailingNewline(
    lines(
      banner('In-app notification model (generated-app notifications table).'),
      `import { DataTypes, Model } from 'sequelize';`,
      `import { sequelize } from '../config/database';`,
      ``,
      `export class Notification extends Model {}`,
      ``,
      `Notification.init(`,
      `  {`,
      `    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },`,
      `    recipientRole: { type: DataTypes.STRING(64), allowNull: true, field: 'recipient_role' },`,
      `    event: { type: DataTypes.STRING(128), allowNull: false, field: 'event' },`,
      `    message: { type: DataTypes.STRING(500), allowNull: false, field: 'message' },`,
      `    entityType: { type: DataTypes.STRING(64), allowNull: true, field: 'entity_type' },`,
      `    entityId: { type: DataTypes.INTEGER, allowNull: true, field: 'entity_id' },`,
      `    isRead: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_read' },`,
      `  },`,
      `  { sequelize, modelName: 'Notification', tableName: 'notifications', underscored: true, timestamps: true }`,
      `);`,
      ``,
      `export default Notification;`
    )
  );

// ── src/services/notification.service.ts ───────────────────────────
export const renderNotificationService = (): string =>
  withTrailingNewline(
    lines(
      banner('Notification recording + read API.'),
      `import { Notification } from '../models/Notification.model';`,
      ``,
      `export interface NotifyInput {`,
      `  event: string;`,
      `  message: string;`,
      `  recipientRole?: string;`,
      `  entityType?: string;`,
      `  entityId?: number;`,
      `}`,
      ``,
      `/** Record an in-app notification. Best-effort — never throws to the caller. */`,
      `export const notify = async (input: NotifyInput): Promise<void> => {`,
      `  try {`,
      `    await Notification.create({`,
      `      event: input.event,`,
      `      message: input.message,`,
      `      recipientRole: input.recipientRole ?? null,`,
      `      entityType: input.entityType ?? null,`,
      `      entityId: input.entityId ?? null,`,
      `      isRead: false,`,
      `    });`,
      `  } catch (err) {`,
      `    console.error('[notify] failed to record notification:', err);`,
      `  }`,
      `};`,
      ``,
      `export const listNotifications = async () =>`,
      `  Notification.findAll({ order: [['id', 'DESC']] as any, limit: 100 });`,
      ``,
      `export const markNotificationRead = async (id: number) => {`,
      `  const record = await Notification.findByPk(id);`,
      `  if (record) {`,
      `    (record as any).isRead = true;`,
      `    await record.save();`,
      `  }`,
      `  return record;`,
      `};`
    )
  );

// ── src/controllers/notification.controller.ts ─────────────────────
export const renderNotificationController = (): string =>
  withTrailingNewline(
    lines(
      banner('Notification HTTP handlers.'),
      `import { Request, Response, NextFunction } from 'express';`,
      `import * as svc from '../services/notification.service';`,
      ``,
      `export const list = async (_req: Request, res: Response, next: NextFunction) => {`,
      `  try {`,
      `    const notifications = await svc.listNotifications();`,
      `    res.json({ success: true, data: { notifications } });`,
      `  } catch (err) { next(err); }`,
      `};`,
      ``,
      `export const markRead = async (req: Request, res: Response, next: NextFunction) => {`,
      `  try {`,
      `    const notification = await svc.markNotificationRead(Number(req.params.id));`,
      `    res.json({ success: true, data: { notification } });`,
      `  } catch (err) { next(err); }`,
      `};`
    )
  );

// ── src/routes/notification.routes.ts ──────────────────────────────
export const renderNotificationRoutes = (): string =>
  withTrailingNewline(
    lines(
      banner('Notification routes (mounted at /api/notifications).'),
      `import { Router } from 'express';`,
      `import { protect } from '../middleware/auth.middleware';`,
      `import * as ctrl from '../controllers/notification.controller';`,
      ``,
      `const router = Router();`,
      `router.use(protect);`,
      ``,
      `router.get('/', ctrl.list);`,
      `router.patch('/:id/read', ctrl.markRead);`,
      ``,
      `export default router;`
    )
  );

// ── src/config/notifications.ts (configured alert triggers as data) ─
export const renderNotificationConfig = (ir: IR): string => {
  const triggers = JSON.stringify(ir.notificationTriggers, null, 2);
  const body = lines(
    banner('Configured alert triggers (from the WorkflowSpec / Set Up Alerts).'),
    `export interface NotificationTrigger {`,
    `  event: string;`,
    `  channel: 'email' | 'in-app' | 'both';`,
    `  description?: string;`,
    `  enabled: boolean;`,
    `}`,
    ``,
    `// These describe which business events raise alerts and on which channel.`,
    `// In-app alerts are recorded in the notifications table; email delivery`,
    `// activates once an email provider (e.g. SendGrid) is configured.`,
    `export const NOTIFICATION_TRIGGERS: NotificationTrigger[] = ${triggers};`
  );
  return withTrailingNewline(body);
};

// ── migration for the notifications table ──────────────────────────
export const renderNotificationsMigration = (): string =>
  withTrailingNewline(
    lines(
      `'use strict';`,
      `// FlowForge generated migration — create "notifications".`,
      ``,
      `module.exports = {`,
      `  async up(queryInterface, Sequelize) {`,
      `    await queryInterface.createTable('notifications', {`,
      `        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },`,
      `        recipient_role: { type: Sequelize.STRING(64), allowNull: true },`,
      `        event: { type: Sequelize.STRING(128), allowNull: false },`,
      `        message: { type: Sequelize.STRING(500), allowNull: false },`,
      `        entity_type: { type: Sequelize.STRING(64), allowNull: true },`,
      `        entity_id: { type: Sequelize.INTEGER, allowNull: true },`,
      `        is_read: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },`,
      `        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },`,
      `        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },`,
      `    });`,
      `  },`,
      ``,
      `  async down(queryInterface) {`,
      `    await queryInterface.dropTable('notifications');`,
      `  },`,
      `};`
    )
  );

// ── DDL for schema.sql (appended after the entity tables) ──────────
export const renderNotificationsSchemaTable = (): string =>
  lines(
    `CREATE TABLE "notifications" (`,
    `  "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,`,
    `  "recipient_role" VARCHAR(64),`,
    `  "event" VARCHAR(128) NOT NULL,`,
    `  "message" VARCHAR(500) NOT NULL,`,
    `  "entity_type" VARCHAR(64),`,
    `  "entity_id" INTEGER,`,
    `  "is_read" BOOLEAN NOT NULL DEFAULT FALSE,`,
    `  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),`,
    `  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
    `);`
  );
