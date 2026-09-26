import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User.model';
import { Project } from '../models/Project.model';
import * as as from '../services/admin.service';
import { logAudit } from '../utils/audit.utils';

const uid = (req: Request) => (req as any).userId as string;

/**
 * Bootstrapping/seed endpoint (own header-key check — runs BEFORE the requireAdmin
 * gate so it can create the first admin on a fresh DB). Idempotent.
 */
export const runSeed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.JWT_ACCESS_SECRET) {
      res.status(403).json({ success: false, message: 'Unauthorized seed attempt' });
      return;
    }

    // 1) MIGRATION: normalise legacy user docs (orgType → organizationType, backfills).
    const migrationResult = await mongoose.connection.collection('users').updateMany(
      { orgType: { $exists: true } },
      [
        {
          $set: {
            organizationType: '$orgType',
            isEmailVerified: { $ifNull: ['$isEmailVerified', true] },
            businessName: { $ifNull: ['$businessName', ''] },
            logoUrl: { $ifNull: ['$logoUrl', null] },
            role: { $ifNull: ['$role', 'user'] },
            loginAttempts: { $ifNull: ['$loginAttempts', 0] },
          },
        },
        { $unset: 'orgType' },
      ]
    );

    // 2) SEED USERS (upsert by email — no hardcoded _id, so Mongo assigns valid ids).
    const hashedPassword = await bcrypt.hash('Test@1234', 12);
    const seedUsers = [
      { fullName: 'Dr. Hassan Khalid', email: 'hassan@cityhealthclinic.com', organizationType: 'clinic', businessName: 'City Health Clinic', role: 'user' },
      { fullName: 'Imran Qureshi', email: 'imran@beaconinstitute.edu.pk', organizationType: 'school', businessName: 'Beacon Institute', role: 'user' },
      { fullName: 'FlowForge Admin', email: 'admin@flowforge.app', organizationType: 'clinic', businessName: 'FlowForge Internal', role: 'admin' },
    ];
    for (const u of seedUsers) {
      await User.updateOne(
        { email: u.email },
        { $set: { ...u, isEmailVerified: true }, $setOnInsert: { password: hashedPassword } },
        { upsert: true }
      );
    }

    // 3) SEED DEMO PROJECTS (resolve owner by email → schema-correct Project docs).
    const byEmail: Record<string, mongoose.Types.ObjectId> = {};
    const owners = await User.find({ email: { $in: seedUsers.map((u) => u.email) } }).select('_id email').lean();
    for (const o of owners as any[]) byEmail[o.email] = o._id;

    const seedProjects = [
      { ownerEmail: 'hassan@cityhealthclinic.com', name: 'Patient Appointment System', domain: 'clinic', status: 'LIVE' },
      { ownerEmail: 'hassan@cityhealthclinic.com', name: 'Pharmacy Inventory Tracker', domain: 'clinic', status: 'SPEC_READY' },
      { ownerEmail: 'imran@beaconinstitute.edu.pk', name: 'Student Admissions Portal', domain: 'school', status: 'LIVE' },
    ];
    let projectsUpserted = 0;
    for (const p of seedProjects) {
      const userId = byEmail[p.ownerEmail];
      if (!userId) continue;
      await Project.findOneAndUpdate(
        { userId, name: p.name },
        { $set: { domain: p.domain, status: p.status, isArchived: false } },
        { upsert: true, setDefaultsOnInsert: true, new: true }
      );
      projectsUpserted++;
    }

    res.status(200).json({
      success: true,
      message: 'Seeding and migration complete.',
      migratedCount: migrationResult.modifiedCount,
      usersUpserted: seedUsers.length,
      projectsUpserted,
      note: 'Admin login: admin@flowforge.app / Test@1234',
    });
  } catch (err) {
    next(err);
  }
};

// ── Admin data API (all gated by requireAdmin in the router) ──

/** GET /admin/stats — platform-wide counts + aggregates. */
export const getStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await as.getStatsService();
    res.json({ success: true, data: { stats } });
  } catch (e) {
    next(e);
  }
};

/** GET /admin/users?search=&page= — paginated users + project counts. */
export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await as.listUsersService({
      search: req.query.search ? String(req.query.search) : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
};

/** PATCH /admin/users/:id/role — promote/demote a user (audited). */
export const setUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const targetId = String(req.params.id);
    const role = String(req.body?.role ?? '');
    const user = await as.setUserRoleService(uid(req), targetId, role);
    res.json({ success: true, data: { user } });
    logAudit({ userId: uid(req), action: 'ADMIN_SET_ROLE', ip: req.ip, meta: { targetId, role } });
  } catch (e) {
    next(e);
  }
};

/** GET /admin/deployments — all deployment records + project/owner info. */
export const listDeployments = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const deployments = await as.listDeploymentsService();
    res.json({ success: true, data: { deployments } });
  } catch (e) {
    next(e);
  }
};

/** GET /admin/activity — recent audit-log activity. */
export const recentActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activity = await as.recentActivityService(req.query.limit ? Number(req.query.limit) : undefined);
    res.json({ success: true, data: { activity } });
  } catch (e) {
    next(e);
  }
};

/** GET /admin/usage — honest platform-activity metrics (no AI cost data). */
export const getUsage = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const usage = await as.getUsageService();
    res.json({ success: true, data: { usage } });
  } catch (e) {
    next(e);
  }
};
