import { Request, Response, NextFunction } from 'express';
import * as gs from '../services/generation.service';
import { logAudit } from '../utils/audit.utils';

const uid = (req: Request) => (req as any).userId as string;
const pid = (req: Request) => String(req.params.projectId);

/** POST /:projectId/start — begin an async generation run (202 + run doc). */
export const start = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const run = await gs.startGenerationService(uid(req), pid(req));
    res.status(202).json({ success: true, data: { run } });
    logAudit({ userId: uid(req), action: 'GENERATION_START', projectId: pid(req), ip: req.ip });
  } catch (e) {
    next(e);
  }
};

/** GET /:projectId/latest — latest run for polling. */
export const latest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const run = await gs.getLatestRunService(uid(req), pid(req));
    res.json({ success: true, data: { run } });
  } catch (e) {
    next(e);
  }
};

/** GET /run/:runId — a specific run (logs/artifacts). */
export const getRun = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const run = await gs.getRunService(uid(req), String(req.params.runId));
    res.json({ success: true, data: { run } });
  } catch (e) {
    next(e);
  }
};
