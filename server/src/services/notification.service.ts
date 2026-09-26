import { Notification, INotification, NotificationType, NotificationChannel } from '../models/Notification.model';
import { NotificationConfig, IAlertTrigger, AlertChannel } from '../models/NotificationConfig.model';
import { Project } from '../models/Project.model';
import { User } from '../models/User.model';
import { WorkflowSpec } from '../models/WorkflowSpec.model';
import { SpecNotificationTrigger } from '../types/spec.types';
import { AppError } from '../utils/AppError';
import { sendNotificationEmail, getFrontendUrl } from './email.service';

export interface CreateNotificationInput {
  userId: string;
  projectId?: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  channel?: NotificationChannel;
  meta?: Record<string, unknown>;
}

/**
 * Create a platform notification. Fire-and-forget — NEVER throws to the caller
 * (mirrors `logAudit`): a notify failure must not break the lifecycle flow that
 * triggered it. If the channel includes email, the recipient's address is looked
 * up and an email is sent best-effort.
 */
export const createNotification = async (input: CreateNotificationInput): Promise<void> => {
  const channel: NotificationChannel = input.channel ?? 'in-app';
  try {
    const doc = await Notification.create({
      userId: input.userId,
      projectId: input.projectId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
      channel,
      emailStatus: 'none',
      meta: input.meta,
    });

    if (channel === 'email' || channel === 'both') {
      const user = await User.findById(input.userId).select('email').lean();
      if (user?.email) {
        const actionUrl = input.link ? `${getFrontendUrl()}${input.link}` : getFrontendUrl();
        try {
          await sendNotificationEmail(user.email, { title: input.title, body: input.body, actionUrl });
          doc.emailStatus = 'sent';
        } catch {
          doc.emailStatus = 'failed';
        }
        await doc.save().catch(() => undefined);
      }
    }
  } catch (err: any) {
    console.warn('[notify] failed to create notification:', err?.message ?? err);
  }
};

// ── Per-type copy + default channel/link, centralized so emit sites stay terse ──

interface NotificationCopy {
  title: string;
  body: string;
  link: string;
  channel: NotificationChannel;
}

export const buildNotificationCopy = (
  type: NotificationType,
  projectName: string,
  projectId: string
): NotificationCopy => {
  const p = `/project/${projectId}`;
  const q = (s: string) => `“${s}”`; // curly-quoted project name
  switch (type) {
    case 'SPEC_READY':
      return {
        title: 'Blueprint ready for review',
        body: `The workflow blueprint for ${q(projectName)} is ready. Review and approve it to continue.`,
        link: `${p}/spec`,
        channel: 'in-app',
      };
    case 'SPEC_APPROVED':
      return {
        title: 'Blueprint approved',
        body: `${q(projectName)}'s blueprint is approved. Set up alerts, then generate your app.`,
        link: `${p}/alerts`,
        channel: 'in-app',
      };
    case 'GENERATION_STARTED':
      return {
        title: 'Build started',
        body: `Generating the backend for ${q(projectName)}…`,
        link: `${p}/generating`,
        channel: 'in-app',
      };
    case 'GENERATION_COMPLETED':
      return {
        title: 'Your app is ready',
        body: `The backend for ${q(projectName)} was generated successfully. Browse the code or preview the app.`,
        link: `${p}/artifacts`,
        channel: 'both',
      };
    case 'GENERATION_FAILED':
      return {
        title: 'Build failed',
        body: `Generation for ${q(projectName)} didn't complete. Open the logs to see what happened.`,
        link: `${p}/logs`,
        channel: 'both',
      };
    case 'EXPORT_READY':
      return {
        title: 'Export ready',
        body: `Your downloadable project ZIP for ${q(projectName)} is ready.`,
        link: `${p}/deploy`,
        channel: 'in-app',
      };
    case 'DEPLOY_LIVE':
      return {
        title: 'Project is live',
        body: `${q(projectName)} is now marked live. 🎉`,
        link: `${p}/deploy`,
        channel: 'both',
      };
  }
};

/**
 * Notify a project's owner about a lifecycle event. Resolves the owner + project
 * name, builds standard copy for the type, then creates the notification.
 * Fire-and-forget; never throws. Emit sites call: `void notifyProjectOwner(id, 'SPEC_APPROVED')`.
 */
export const notifyProjectOwner = async (
  projectId: string,
  type: NotificationType,
  opts: { meta?: Record<string, unknown>; channelOverride?: NotificationChannel } = {}
): Promise<void> => {
  try {
    const project = await Project.findById(projectId).select('userId name').lean();
    if (!project) return;
    const copy = buildNotificationCopy(type, project.name, String(projectId));
    await createNotification({
      userId: String(project.userId),
      projectId: String(projectId),
      type,
      title: copy.title,
      body: copy.body,
      link: copy.link,
      channel: opts.channelOverride ?? copy.channel,
      meta: opts.meta,
    });
  } catch (err: any) {
    console.warn('[notify] notifyProjectOwner failed:', err?.message ?? err);
  }
};

// ── Read-side queries (scoped to the requesting user) ──────────────────────────

export interface ListOptions {
  limit?: number;
  /** ISO date cursor — return items strictly older than this (createdAt). */
  before?: string;
}

export const listNotifications = async (userId: string, opts: ListOptions = {}): Promise<INotification[]> => {
  const limit = Math.min(Math.max(opts.limit ?? 20, 1), 50);
  const query: Record<string, unknown> = { userId };
  if (opts.before) {
    const cursor = new Date(opts.before);
    if (!Number.isNaN(cursor.getTime())) query.createdAt = { $lt: cursor };
  }
  return Notification.find(query).sort({ createdAt: -1 }).limit(limit);
};

export const getUnreadCount = (userId: string): Promise<number> =>
  Notification.countDocuments({ userId, isRead: false });

export const markRead = async (userId: string, id: string): Promise<INotification | null> =>
  Notification.findOneAndUpdate(
    { _id: id, userId },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  );

export const markAllRead = async (userId: string): Promise<number> => {
  const res = await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
  return res.modifiedCount ?? 0;
};

// ── Alert config: the GENERATED app's notification triggers (Set Up Alerts) ─────

const VALID_CHANNELS: AlertChannel[] = ['email', 'in-app', 'both'];

const assertProjectOwner = async (userId: string, projectId: string) => {
  const project = await Project.findOne({ _id: projectId, userId }).select('_id').lean();
  if (!project) throw new AppError('Project not found.', 404, 'NOT_FOUND');
};

/** Seed alert triggers from the project's latest WorkflowSpec (all enabled). */
const seedTriggersFromSpec = async (projectId: string): Promise<IAlertTrigger[]> => {
  const spec = await WorkflowSpec.findOne({ projectId }).sort({ version: -1 }).lean();
  const specTriggers = (spec?.notificationTriggers ?? []) as SpecNotificationTrigger[];
  return specTriggers.map((t) => ({
    event: t.event,
    channel: VALID_CHANNELS.includes(t.channel as AlertChannel) ? (t.channel as AlertChannel) : 'both',
    description: t.description,
    enabled: true,
  }));
};

/** Get the alert config, seeding it from the spec on first access. */
export const getAlertConfigService = async (userId: string, projectId: string): Promise<IAlertTrigger[]> => {
  await assertProjectOwner(userId, projectId);
  const existing = await NotificationConfig.findOne({ projectId, userId }).lean();
  if (existing) return existing.triggers as IAlertTrigger[];

  const seeded = await seedTriggersFromSpec(projectId);
  const created = await NotificationConfig.create({ projectId, userId, triggers: seeded });
  return created.triggers as IAlertTrigger[];
};

/** Persist edited alert triggers (upsert). */
export const saveAlertConfigService = async (
  userId: string,
  projectId: string,
  triggers: unknown
): Promise<IAlertTrigger[]> => {
  await assertProjectOwner(userId, projectId);
  if (!Array.isArray(triggers)) {
    throw new AppError('triggers must be an array.', 400, 'VALIDATION_ERROR');
  }
  const clean: IAlertTrigger[] = triggers.map((t: any) => {
    const event = String(t?.event ?? '').trim();
    if (!event) throw new AppError('Each alert needs an event name.', 400, 'VALIDATION_ERROR');
    const channel: AlertChannel = VALID_CHANNELS.includes(t?.channel) ? t.channel : 'both';
    return {
      event,
      channel,
      enabled: t?.enabled !== false,
      description: t?.description ? String(t.description) : undefined,
    };
  });
  const saved = await NotificationConfig.findOneAndUpdate(
    { projectId, userId },
    { $set: { triggers: clean } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return saved!.triggers as IAlertTrigger[];
};
