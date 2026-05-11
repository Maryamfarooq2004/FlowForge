import { Router, Request, Response, NextFunction } from 'express';
import { protect } from '../middleware/auth.middleware';
import * as ps from '../services/project.service';

const router = Router();
// All project routes require authentication
router.use(protect);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const result = await ps.getProjectsService(userId, req.query as any);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.get('/archived', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await ps.getArchivedProjectsService((req as any).userId);
    res.json({ success: true, data: { items } });
  } catch (err) { next(err); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await ps.getProjectService((req as any).userId, req.params.id);
    res.json({ success: true, data: { project } });
  } catch (err) { next(err); }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, domain } = req.body;
    if (!name || !domain) {
      return res.status(400).json({
        success: false, code: 'MISSING_FIELDS',
        message: 'name and domain are required.'
      });
    }
    const project = await ps.createProjectService((req as any).userId, name, domain);
    res.status(201).json({ success: true, data: { project } });
  } catch (err) { next(err); }
});

router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await ps.updateProjectService(
      (req as any).userId, req.params.id, req.body
    );
    res.json({ success: true, data: { project } });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ps.deleteProjectService((req as any).userId, req.params.id);
    res.json({ success: true, message: 'Project deleted.' });
  } catch (err) { next(err); }
});

router.post('/:id/duplicate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await ps.duplicateProjectService(
      (req as any).userId, req.params.id
    );
    res.status(201).json({ success: true, data: { project } });
  } catch (err) { next(err); }
});

router.patch('/:id/archive', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await ps.archiveProjectService(
      (req as any).userId, req.params.id
    );
    res.json({ success: true, data: { project } });
  } catch (err) { next(err); }
});

router.patch('/:id/restore', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await ps.updateProjectService(
      (req as any).userId, req.params.id, { isArchived: false } as any
    );
    res.json({ success: true, data: { project } });
  } catch (err) { next(err); }
});

export default router;
