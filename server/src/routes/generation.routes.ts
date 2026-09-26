import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import * as gc from '../controllers/generation.controller';

const router = Router();
router.use(protect);

router.post('/:projectId/start', gc.start);
router.get('/:projectId/latest', gc.latest);
router.get('/run/:runId', gc.getRun);

export default router;
