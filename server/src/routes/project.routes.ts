import { Router, Request, Response, NextFunction } from 'express';
import { protect } from '../middleware/auth.middleware';
import * as ps from '../services/project.service';
import { Project } from '../models/Project.model';

const router = Router();
router.use(protect);

const uid = (req: Request) => (req as any).userId as string;

// Get all projects for logged-in user (real MongoDB data)
router.get('/', async (req, res, next) => {
  try {
    const result = await ps.getProjectsService(uid(req), req.query as any);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
});

// Check if first-time user (no projects)
router.get('/first-time-check', async (req, res, next) => {
  try {
    const isFirstTime = await ps.isFirstTimeUserService(uid(req));
    res.json({ success: true, data: { isFirstTime } });
  } catch (e) { next(e); }
});

// Get archived projects
router.get('/archived', async (req, res, next) => {
  try {
    const items = await ps.getArchivedProjectsService(uid(req));
    res.json({ success: true, data: { items } });
  } catch (e) { next(e); }
});

// Get single project
router.get('/:id', async (req, res, next) => {
  try {
    const project = await ps.getProjectService(uid(req), req.params.id);
    res.json({ success: true, data: { project } });
  } catch (e) { next(e); }
});

// Get resume point for a project
router.get('/:id/resume', async (req, res, next) => {
  try {
    const result = await ps.getResumePointService(uid(req), req.params.id);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
});

// Create project (saves to MongoDB, returns real _id)
router.post('/', async (req, res, next) => {
  try {
    const { name, domain } = req.body;
    if (!name || !domain) {
      return res.status(400).json({
        success: false, code: 'MISSING_FIELDS',
        message: 'name and domain are required.'
      });
    }
    const project = await ps.createProjectService(uid(req), name, domain);
    res.status(201).json({ success: true, data: { project } });
  } catch (e) { next(e); }
});

// Update project progress
router.patch('/:id/progress', async (req, res, next) => {
  try {
    const { phase, lastActiveScreen, completedStep } = req.body;
    const project = await ps.updateProjectProgressService(
      uid(req), req.params.id, phase, lastActiveScreen, completedStep
    );
    res.json({ success: true, data: { project } });
  } catch (e) { next(e); }
});

// Archive
router.patch('/:id/archive', async (req, res, next) => {
  try {
    const project = await ps.archiveProjectService(uid(req), req.params.id);
    res.json({ success: true, data: { project } });
  } catch (e) { next(e); }
});

// Restore
router.patch('/:id/restore', async (req, res, next) => {
  try {
    const project = await ps.updateProjectProgressService(
      uid(req), req.params.id,
      'intake_form', '', undefined
    );
    await Project.findByIdAndUpdate(req.params.id, { isArchived: false });
    res.json({ success: true, data: { project } });
  } catch (e) { next(e); }
});

// Duplicate
router.post('/:id/duplicate', async (req, res, next) => {
  try {
    const project = await ps.duplicateProjectService(uid(req), req.params.id);
    res.status(201).json({ success: true, data: { project } });
  } catch (e) { next(e); }
});

// Delete
router.delete('/:id', async (req, res, next) => {
  try {
    await ps.deleteProjectService(uid(req), req.params.id);
    res.json({ success: true, message: 'Project deleted.' });
  } catch (e) { next(e); }
});

export default router;
