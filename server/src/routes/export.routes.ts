import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import * as ec from '../controllers/export.controller';

const router = Router();
router.use(protect);

router.get('/:projectId/zip', ec.downloadZip);
router.get('/:projectId', ec.getDeployment);
router.patch('/:projectId/live-url', ec.recordLiveUrl);

export default router;
