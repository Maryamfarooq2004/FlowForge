import { Request, Response, NextFunction } from 'express';
import * as ds from '../services/document.service';

const uid = (req: Request) => (req as any).userId as string;
const pid = (req: Request) => String(req.params.projectId);

/** POST /documents/:projectId/upload — multipart; parse + detect each file. */
export const upload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = ((req as any).files as Express.Multer.File[]) || [];
    const documents = await ds.uploadDocumentsService(uid(req), pid(req), files);
    res.status(201).json({ success: true, data: { documents } });
  } catch (e) {
    next(e);
  }
};

/** GET /documents/:projectId — list uploaded documents (newest first). */
export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const documents = await ds.listDocumentsService(uid(req), pid(req));
    res.json({ success: true, data: { documents } });
  } catch (e) {
    next(e);
  }
};

/** DELETE /documents/:projectId/:docId — remove a document. */
export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ds.deleteDocumentService(uid(req), pid(req), String(req.params.docId));
    res.json({ success: true, data: { deleted: true } });
  } catch (e) {
    next(e);
  }
};

/** POST /documents/:projectId/merge — merge confirmed items into the IntakeBundle. */
export const merge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const documentItems = await ds.mergeDocumentDataService(uid(req), pid(req), req.body);
    res.json({ success: true, data: { documentItems } });
  } catch (e) {
    next(e);
  }
};
