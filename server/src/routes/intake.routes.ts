import { Router, Request, Response, NextFunction } from 'express';
import { protect } from '../middleware/auth.middleware';
import * as is from '../services/intake.service';

const router = Router({ mergeParams: true });
router.use(protect);

const uid = (req: Request) => (req as any).userId as string;

// GET questions (global, but scoped to intake router for convenience)
router.get('/questions', async (req, res, next) => {
  try {
    const questions = await is.getQuestionsService(req.query.category as string);
    res.json({ success: true, data: questions });
  } catch (e) { next(e); }
});

// GET intake bundle (prefill forms on resume)
router.get('/', async (req, res, next) => {
  try {
    const { projectId } = req.params as any;
    const bundle = await is.getIntakeBundleService(uid(req), projectId);
    res.json({ success: true, data: { bundle } });
  } catch (e) { next(e); }
});

// POST save structured form data
router.post('/form', async (req, res, next) => {
  try {
    const { projectId } = req.params as any;
    const bundle = await is.saveStructuredFormService(
      uid(req), projectId, req.body.formData
    );
    res.json({ success: true, data: { bundle } });
  } catch (e) { next(e); }
});

// PATCH save guided screen (screen 1-4)
router.patch('/screen/:screenNumber', async (req, res, next) => {
  try {
    const { projectId, screenNumber: sNum } = req.params as any;
    const screenNumber = parseInt(sNum) as 1|2|3|4;
    if (![1, 2, 3, 4].includes(screenNumber)) {
      return res.status(400).json({
        success: false, code: 'INVALID_SCREEN',
        message: 'Screen number must be 1, 2, 3, or 4.'
      });
    }
    const { content, detectedItems = [], confirmedItems = [] } = req.body;
    const bundle = await is.saveGuidedScreenService(
      uid(req), projectId, screenNumber,
      content, detectedItems, confirmedItems
    );
    res.json({ success: true, data: { bundle } });
  } catch (e) { next(e); }
});

// PATCH auto-save (no progress advance)
router.patch('/screen/:screenNumber/autosave', async (req, res, next) => {
  try {
    const { projectId, screenNumber: sNum } = req.params as any;
    const screenNumber = parseInt(sNum) as 1|2|3|4;
    await is.autoSaveGuidedScreenService(
      uid(req), projectId, screenNumber, req.body.content
    );
    res.json({ success: true, message: 'Auto-saved.' });
  } catch (e) { next(e); }
});

// POST assemble bundle
router.post('/assemble', async (req, res, next) => {
  try {
    const { projectId } = req.params as any;
    console.log(`[IntakeRouter] Hit /assemble for project ${projectId}`);
    const bundle = await is.assembleBundleService(uid(req), projectId);
    res.json({ success: true, data: { bundle } });
  } catch (e) { next(e); }
});

export default router;
