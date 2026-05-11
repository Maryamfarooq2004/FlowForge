import { Router } from 'express';
import * as intakeController from '../controllers/intake.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All intake routes require authentication
router.use(protect);

// ── Questions ─────────────────────────────────────────────────────────────────
// GET /api/v1/intake/questions?category=clinic|school
router.get('/questions', intakeController.getQuestions);

// ── Per-project intake ────────────────────────────────────────────────────────
// GET  /api/v1/intake/:projectId              → get full bundle (resume)
router.get('/:projectId', intakeController.getIntakeBundle);

// POST /api/v1/intake/:projectId/form         → submit close-ended structured form
router.post('/:projectId/form', intakeController.submitIntakeForm);

// PATCH /api/v1/intake/:projectId/screen/:screenNumber → save individual guided screen
router.patch('/:projectId/screen/:screenNumber', intakeController.saveScreen);

// POST /api/v1/intake/:projectId/assemble     → assemble final IntakeBundle JSON
router.post('/:projectId/assemble', intakeController.assembleBundle);

export default router;
