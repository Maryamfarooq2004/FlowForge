import { Router, Request, Response, NextFunction } from 'express';
import { protect } from '../middleware/auth.middleware';
import * as is from '../services/intake.service';

const router = Router({ mergeParams: true });
router.use(protect);

const uid = (req: Request) => (req as any).userId as string;

// The flat mount (/api/v1/intake/*) has no :projectId — reject clearly instead of
// producing a confusing 404 deep in the service. Only /questions works flat.
const requireProject = (req: Request, res: Response): string | null => {
  const { projectId } = req.params as any;
  if (!projectId) {
    res.status(400).json({
      success: false,
      code: 'PROJECT_REQUIRED',
      message: 'This intake action must be called under /projects/:projectId/intake.',
    });
    return null;
  }
  return projectId;
};

// GET questions (global; category is validated in the service)
router.get('/questions', async (req, res, next) => {
  try {
    const questions = await is.getQuestionsService(req.query.category as string);
    res.json({ success: true, data: questions });
  } catch (e) { next(e); }
});

// GET intake bundle (prefill forms on resume)
router.get('/', async (req, res, next) => {
  try {
    const projectId = requireProject(req, res); if (!projectId) return;
    const bundle = await is.getIntakeBundleService(uid(req), projectId);
    res.json({ success: true, data: { bundle } });
  } catch (e) { next(e); }
});

// POST save structured form data → { bundle, complete, missingRequired }
router.post('/form', async (req, res, next) => {
  try {
    const projectId = requireProject(req, res); if (!projectId) return;
    const result = await is.saveStructuredFormService(uid(req), projectId, req.body.formData);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
});

// PATCH save guided screen (screen 1-4)
router.patch('/screen/:screenNumber', async (req, res, next) => {
  try {
    const projectId = requireProject(req, res); if (!projectId) return;
    const screenNumber = parseInt(req.params.screenNumber, 10) as 1 | 2 | 3 | 4;
    if (![1, 2, 3, 4].includes(screenNumber)) {
      return res.status(400).json({
        success: false, code: 'INVALID_SCREEN',
        message: 'Screen number must be 1, 2, 3, or 4.',
      });
    }
    const { content, detectedItems = [], confirmedItems = [] } = req.body;
    const bundle = await is.saveGuidedScreenService(
      uid(req), projectId, screenNumber, content, detectedItems, confirmedItems
    );
    res.json({ success: true, data: { bundle } });
  } catch (e) { next(e); }
});

// PATCH auto-save (no progress advance)
router.patch('/screen/:screenNumber/autosave', async (req, res, next) => {
  try {
    const projectId = requireProject(req, res); if (!projectId) return;
    const screenNumber = parseInt(req.params.screenNumber, 10) as 1 | 2 | 3 | 4;
    if (![1, 2, 3, 4].includes(screenNumber)) {
      return res.status(400).json({
        success: false, code: 'INVALID_SCREEN',
        message: 'Screen number must be 1, 2, 3, or 4.',
      });
    }
    await is.autoSaveGuidedScreenService(uid(req), projectId, screenNumber, req.body.content);
    res.json({ success: true, message: 'Auto-saved.' });
  } catch (e) { next(e); }
});

// POST validate (FE2.11 pre-check without assembling)
router.post('/validate', async (req, res, next) => {
  try {
    const projectId = requireProject(req, res); if (!projectId) return;
    const result = await is.validateIntakeService(uid(req), projectId);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
});

// POST assemble bundle — blocked (422) when consistency validation fails
router.post('/assemble', async (req, res, next) => {
  try {
    const projectId = requireProject(req, res); if (!projectId) return;
    const result = await is.assembleBundleService(uid(req), projectId);
    if (!result.valid) {
      return res.status(422).json({
        success: false,
        code: 'INTAKE_VALIDATION_FAILED',
        message: 'Your intake needs a few fixes before it can be converted.',
        errors: result.errors,
        warnings: result.warnings,
        data: { bundle: result.bundle },
      });
    }
    res.json({ success: true, data: { bundle: result.bundle, warnings: result.warnings } });
  } catch (e) { next(e); }
});

export default router;
