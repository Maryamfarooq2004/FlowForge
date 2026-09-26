import { Request, Response, NextFunction } from 'express';
import * as ns from '../services/notification.service';

const uid = (req: Request) => (req as any).userId as string;

/** GET /notifications — my notifications, newest first (paginated via ?before, ?limit). */
export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await ns.listNotifications(uid(req), {
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      before: req.query.before ? String(req.query.before) : undefined,
    });
    const unreadCount = await ns.getUnreadCount(uid(req));
    res.json({ success: true, data: { notifications: items, unreadCount } });
  } catch (e) {
    next(e);
  }
};

/** GET /notifications/unread-count — cheap 30s poll target. */
export const unreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await ns.getUnreadCount(uid(req));
    res.json({ success: true, data: { count } });
  } catch (e) {
    next(e);
  }
};

/** PATCH /notifications/:id/read — mark one read. */
export const markRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await ns.markRead(uid(req), String(req.params.id));
    res.json({ success: true, data: { notification } });
  } catch (e) {
    next(e);
  }
};

/** POST /notifications/read-all — mark all my notifications read. */
export const markAllRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const modified = await ns.markAllRead(uid(req));
    res.json({ success: true, data: { modified } });
  } catch (e) {
    next(e);
  }
};

// ── Alert config (generated-app notification triggers) ──

/** GET /notifications/config/:projectId — triggers, seeded from the spec on first access. */
export const getConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const triggers = await ns.getAlertConfigService(uid(req), String(req.params.projectId));
    res.json({ success: true, data: { triggers } });
  } catch (e) {
    next(e);
  }
};

/** PUT /notifications/config/:projectId — persist edited triggers. */
export const saveConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const triggers = await ns.saveAlertConfigService(uid(req), String(req.params.projectId), req.body?.triggers);
    res.json({ success: true, data: { triggers } });
  } catch (e) {
    next(e);
  }
};
