import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';

const router = Router();

// Secure seeding endpoint
router.post('/seed', adminController.runSeed);

export default router;
