import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import * as pc from '../controllers/preview.controller';

const router = Router();
router.use(protect);

router.post('/:projectId/init', pc.init);
router.get('/:projectId/state', pc.getState);
router.patch('/:projectId/role', pc.setRole);
router.post('/:projectId/reset', pc.reset);

router.post('/:projectId/entities/:entityKey', pc.createRecord);
router.patch('/:projectId/entities/:entityKey/:recordId', pc.updateRecord);
router.delete('/:projectId/entities/:entityKey/:recordId', pc.deleteRecord);
router.post('/:projectId/entities/:entityKey/:recordId/transition', pc.transition);

export default router;
