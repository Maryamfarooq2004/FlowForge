import { AuditLog } from '../models/AuditLog.model';

export interface AuditEntry {
  action: string;
  userId?: string;
  projectId?: string;
  ip?: string;
  meta?: Record<string, unknown>;
}

/**
 * Fire-and-forget audit write. Never throws and never blocks the request —
 * a failed audit write must not break the user-facing operation.
 */
export const logAudit = (entry: AuditEntry): void => {
  AuditLog.create({
    action: entry.action,
    userId: entry.userId,
    projectId: entry.projectId,
    ip: entry.ip,
    meta: entry.meta,
  }).catch((err) => {
    console.warn('[audit] failed to write audit log:', err?.message ?? err);
  });
};
