import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import * as tc from '../controllers/theme.controller';

const router = Router();
router.use(protect);

router.get('/presets', tc.getPresets);
router.get('/:projectId', tc.getTheme);
router.put('/:projectId', tc.saveTheme);

export default router;
