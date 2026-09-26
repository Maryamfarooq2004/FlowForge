import { Request, Response, NextFunction } from 'express';
import { ZipArchive } from 'archiver';
import * as es from '../services/export.service';
import { logAudit } from '../utils/audit.utils';

const uid = (req: Request) => (req as any).userId as string;
const pid = (req: Request) => String(req.params.projectId);

/** GET /:projectId/zip — stream a real ZIP of the generated project (binary). */
export const downloadZip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { run, project } = await es.getLatestCompletedRun(uid(req), pid(req));
    const slug = es.slugify(project.name);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${slug}.zip"`);

    const archive = new ZipArchive({ zlib: { level: 9 } });
    archive.on('error', (err: Error) => {
      // Headers already sent — can't fall back to JSON; end the stream.
      res.destroy(err);
    });
    archive.pipe(res);

    for (const entry of es.zipEntries(run, slug)) {
      archive.append(entry.contents, { name: entry.name });
    }
    await archive.finalize();

    void es.recordExportService(uid(req), pid(req));
    logAudit({ userId: uid(req), action: 'EXPORT_ZIP', projectId: pid(req), ip: req.ip, meta: { runId: String(run._id) } });
  } catch (e) {
    // Only reachable before streaming begins (getLatestCompletedRun throw).
    next(e);
  }
};

/** GET /:projectId — deployment info (JSON). */
export const getDeployment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deployment = await es.getDeploymentService(uid(req), pid(req));
    res.json({ success: true, data: { deployment } });
  } catch (e) {
    next(e);
  }
};

/** PATCH /:projectId/live-url — record a user-supplied live URL; flips to LIVE. */
export const recordLiveUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deployment = await es.recordLiveUrlService(uid(req), pid(req), String(req.body?.url ?? ''));
    res.json({ success: true, data: { deployment } });
    logAudit({ userId: uid(req), action: 'DEPLOY_LIVE_URL', projectId: pid(req), ip: req.ip });
  } catch (e) {
    next(e);
  }
};
