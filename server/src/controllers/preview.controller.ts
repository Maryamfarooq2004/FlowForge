import { Request, Response, NextFunction } from 'express';
import * as ps from '../services/preview.service';
import { logAudit } from '../utils/audit.utils';

const uid = (req: Request) => (req as any).userId as string;
const pid = (req: Request) => String(req.params.projectId);
const ek = (req: Request) => String(req.params.entityKey);
const rid = (req: Request) => String(req.params.recordId);

export const init = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const state = await ps.initSandboxService(uid(req), pid(req));
    res.json({ success: true, data: { state } });
    logAudit({ userId: uid(req), action: 'PREVIEW_OPEN', projectId: pid(req), ip: req.ip });
  } catch (e) {
    next(e);
  }
};

export const getState = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const state = await ps.getStateService(uid(req), pid(req));
    res.json({ success: true, data: { state } });
  } catch (e) {
    next(e);
  }
};

export const setRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const state = await ps.setRoleService(uid(req), pid(req), String(req.body?.roleKey));
    res.json({ success: true, data: { state } });
  } catch (e) {
    next(e);
  }
};

export const createRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const state = await ps.createRecordService(uid(req), pid(req), ek(req), req.body ?? {});
    res.status(201).json({ success: true, data: { state } });
  } catch (e) {
    next(e);
  }
};

export const updateRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const state = await ps.updateRecordService(uid(req), pid(req), ek(req), rid(req), req.body ?? {});
    res.json({ success: true, data: { state } });
  } catch (e) {
    next(e);
  }
};

export const deleteRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const state = await ps.deleteRecordService(uid(req), pid(req), ek(req), rid(req));
    res.json({ success: true, data: { state } });
  } catch (e) {
    next(e);
  }
};

export const transition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const state = await ps.transitionRecordService(uid(req), pid(req), ek(req), rid(req), String(req.body?.to));
    res.json({ success: true, data: { state } });
  } catch (e) {
    next(e);
  }
};

export const reset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const state = await ps.resetSandboxService(uid(req), pid(req));
    res.json({ success: true, data: { state } });
  } catch (e) {
    next(e);
  }
};
