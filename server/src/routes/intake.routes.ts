import { Router } from 'express';
import * as intakeController from '../controllers/intake.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.patch('/:projectId/form', intakeController.saveIntakeForm);

export default router;
