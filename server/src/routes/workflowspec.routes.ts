import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import * as sc from '../controllers/workflowspec.controller';

const router = Router();
router.use(protect);

router.post('/:projectId/generate', sc.generate);
router.get('/:projectId', sc.get);
router.patch('/:projectId', sc.update);
router.patch('/:projectId/suggestions/:suggestionId', sc.applySuggestion);
router.patch('/:projectId/risks/:riskId', sc.resolveRisk);
router.patch('/:projectId/checklist/:key', sc.confirmChecklistItem);
router.post('/:projectId/approve', sc.approve);

export default router;
