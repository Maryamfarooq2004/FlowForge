import { User } from '../models/User.model';
import { Project } from '../models/Project.model';
import { GenerationRun } from '../models/GenerationRun.model';
import { DeploymentRecord } from '../models/DeploymentRecord.model';
import { Notification } from '../models/Notification.model';
import { AuditLog } from '../models/AuditLog.model';
import { AppError } from '../utils/AppError';

const DAY = 86_400_000;
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ── Platform stats ─────────────────────────────────────────────────

export const getStatsService = async () => {
  const weekAgo = new Date(Date.now() - 7 * DAY);
  const [
    totalUsers, adminUsers, clinicUsers, schoolUsers, newUsers,
    totalProjects, archivedProjects, projectsByStatus,
    totalGen, completedGen, failedGen, runningGen, avgDur,
    exportedDep, liveDep,
    sentNotif, failedNotif,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ organizationType: 'clinic' }),
    User.countDocuments({ organizationType: 'school' }),
    User.countDocuments({ createdAt: { $gte: weekAgo } }),
    Project.countDocuments({}),
    Project.countDocuments({ isArchived: true }),
    Project.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    GenerationRun.countDocuments({}),
    GenerationRun.countDocuments({ status: 'completed' }),
    GenerationRun.countDocuments({ status: 'failed' }),
    GenerationRun.countDocuments({ status: { $in: ['queued', 'running'] } }),
    GenerationRun.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, avg: { $avg: '$stats.durationMs' } } },
    ]),
    DeploymentRecord.countDocuments({ status: 'exported' }),
    DeploymentRecord.countDocuments({ status: 'live' }),
    Notification.countDocuments({ emailStatus: 'sent' }),
    Notification.countDocuments({ emailStatus: 'failed' }),
  ]);

  const byStatus: Record<string, number> = { INTAKE: 0, SPEC_READY: 0, PREVIEW: 0, LIVE: 0 };
  for (const row of projectsByStatus as Array<{ _id: string; n: number }>) {
    if (row._id in byStatus) byStatus[row._id] = row.n;
  }

  return {
    users: { total: totalUsers, admins: adminUsers, clinics: clinicUsers, schools: schoolUsers, newThisWeek: newUsers },
    projects: { total: totalProjects, archived: archivedProjects, byStatus },
    generations: {
      total: totalGen,
      completed: completedGen,
      failed: failedGen,
      running: runningGen,
      avgDurationMs: Math.round((avgDur as Array<{ avg: number }>)[0]?.avg ?? 0),
    },
    deployments: { exported: exportedDep, live: liveDep },
    notifications: { sent: sentNotif, failed: failedNotif },
  };
};

// ── Users (list + role management) ─────────────────────────────────

export const listUsersService = async (opts: { search?: string; page?: number; limit?: number }) => {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(Math.max(opts.limit ?? 20, 1), 50);
  const query: Record<string, unknown> = {};
  if (opts.search && opts.search.trim()) {
    const re = new RegExp(escapeRegex(opts.search.trim()), 'i');
    query.$or = [{ fullName: re }, { email: re }];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('fullName email organizationType role isEmailVerified lastLoginAt createdAt')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const ids = users.map((u) => u._id);
  const counts = await Project.aggregate([
    { $match: { userId: { $in: ids } } },
    { $group: { _id: '$userId', n: { $sum: 1 } } },
  ]);
  const countMap = new Map((counts as Array<{ _id: any; n: number }>).map((c) => [String(c._id), c.n]));

  return {
    users: users.map((u: any) => ({
      id: String(u._id),
      fullName: u.fullName,
      email: u.email,
      organizationType: u.organizationType,
      role: u.role,
      isEmailVerified: u.isEmailVerified,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
      projectCount: countMap.get(String(u._id)) ?? 0,
    })),
    total,
    page,
    limit,
  };
};

export const setUserRoleService = async (actorId: string, targetId: string, role: string) => {
  if (role !== 'user' && role !== 'admin') {
    throw new AppError('Role must be "user" or "admin".', 400, 'VALIDATION_ERROR');
  }
  if (actorId === targetId && role !== 'admin') {
    throw new AppError('You cannot remove your own admin access.', 400, 'SELF_DEMOTE');
  }
  const user = await User.findByIdAndUpdate(targetId, { role }, { new: true }).select(
    'fullName email role organizationType'
  );
  if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');
  return user;
};

// ── Deployments overview ───────────────────────────────────────────

export const listDeploymentsService = async () => {
  const deps = await DeploymentRecord.find({}).sort({ updatedAt: -1 }).limit(100).lean();
  const projIds = deps.map((d) => d.projectId);
  const projects = await Project.find({ _id: { $in: projIds } }).select('name domain status userId').lean();
  const projMap = new Map(projects.map((p: any) => [String(p._id), p]));
  const userIds = [...new Set(projects.map((p: any) => String(p.userId)))];
  const users = await User.find({ _id: { $in: userIds } }).select('email').lean();
  const userMap = new Map(users.map((u: any) => [String(u._id), u.email]));

  return deps.map((d: any) => {
    const p = projMap.get(String(d.projectId));
    return {
      id: String(d._id),
      projectName: p?.name ?? '(deleted project)',
      domain: p?.domain,
      status: d.status,
      exportCount: d.exportCount,
      liveUrl: d.liveUrl,
      lastExportAt: d.lastExportAt,
      ownerEmail: p ? userMap.get(String(p.userId)) : undefined,
      updatedAt: d.updatedAt,
    };
  });
};

// ── Recent activity (audit feed) ───────────────────────────────────

export const recentActivityService = async (limit = 30) => {
  const n = Math.min(Math.max(limit, 1), 100);
  const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(n).lean();
  const userIds = [...new Set(logs.map((l: any) => (l.userId ? String(l.userId) : null)).filter(Boolean))];
  const users = await User.find({ _id: { $in: userIds } }).select('email').lean();
  const emailMap = new Map(users.map((u: any) => [String(u._id), u.email]));

  return logs.map((l: any) => ({
    id: String(l._id),
    action: l.action,
    email: l.userId ? emailMap.get(String(l.userId)) : undefined,
    projectId: l.projectId ? String(l.projectId) : undefined,
    ip: l.ip,
    createdAt: l.createdAt,
  }));
};

// ── Platform usage (honest substitute for AI-cost metrics) ─────────

export const getUsageService = async () => {
  const since30 = new Date(Date.now() - 30 * DAY);
  const since14 = new Date(Date.now() - 14 * DAY);

  const [actionCounts, daily, completedGen, failedGen, avgDur, sentNotif, failedNotif] = await Promise.all([
    AuditLog.aggregate([
      { $match: { createdAt: { $gte: since30 } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AuditLog.aggregate([
      { $match: { createdAt: { $gte: since14 } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    GenerationRun.countDocuments({ status: 'completed' }),
    GenerationRun.countDocuments({ status: 'failed' }),
    GenerationRun.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, avg: { $avg: '$stats.durationMs' } } },
    ]),
    Notification.countDocuments({ emailStatus: 'sent' }),
    Notification.countDocuments({ emailStatus: 'failed' }),
  ]);

  return {
    actionCounts: (actionCounts as Array<{ _id: string; count: number }>).map((a) => ({ action: a._id, count: a.count })),
    daily: (daily as Array<{ _id: string; count: number }>).map((d) => ({ date: d._id, count: d.count })),
    generations: {
      completed: completedGen,
      failed: failedGen,
      avgDurationMs: Math.round((avgDur as Array<{ avg: number }>)[0]?.avg ?? 0),
    },
    emails: { sent: sentNotif, failed: failedNotif },
    aiTracked: false, // Gemini is stubbed in this build — request/cost metrics are not tracked.
  };
};
