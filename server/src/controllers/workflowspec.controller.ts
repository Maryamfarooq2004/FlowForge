import { Request, Response, NextFunction } from 'express';
import * as ss from '../services/workflowspec.service';
import { logAudit } from '../utils/audit.utils';

const uid = (req: Request) => (req as any).userId as string;
const pid = (req: Request) => String(req.params.projectId);

export const generate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const spec = await ss.generateSpecService(uid(req), pid(req));
    res.status(201).json({ success: true, data: { spec } });
    logAudit({ userId: uid(req), action: 'SPEC_GENERATE', projectId: pid(req), ip: req.ip });
  } catch (e) {
    next(e);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const spec = await ss.getSpecService(uid(req), pid(req));
    res.json({ success: true, data: { spec } });
  } catch (e) {
    next(e);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const spec = await ss.updateSpecService(uid(req), pid(req), req.body);
    res.json({ success: true, data: { spec } });
  } catch (e) {
    next(e);
  }
};

export const applySuggestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const applied = req.body?.applied ?? true;
    const spec = await ss.applySuggestionService(
      uid(req),
      pid(req),
      String(req.params.suggestionId),
      applied
    );
    res.json({ success: true, data: { spec } });
  } catch (e) {
    next(e);
  }
};

export const resolveRisk = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const spec = await ss.resolveRiskService(
      uid(req),
      pid(req),
      String(req.params.riskId),
      req.body?.resolved ?? true
    );
    res.json({ success: true, data: { spec } });
  } catch (e) {
    next(e);
  }
};

export const confirmChecklistItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const spec = await ss.confirmChecklistService(
      uid(req),
      pid(req),
      String(req.params.key),
      req.body?.confirmed ?? true
    );
    res.json({ success: true, data: { spec } });
  } catch (e) {
    next(e);
  }
};

export const approve = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const spec = await ss.approveSpecService(uid(req), pid(req));
    res.json({ success: true, data: { spec } });
    logAudit({ userId: uid(req), action: 'SPEC_APPROVE', projectId: pid(req), ip: req.ip });
  } catch (e) {
    next(e);
  }
};
