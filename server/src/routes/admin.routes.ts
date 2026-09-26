import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/rbac.middleware';
import * as adminController from '../controllers/admin.controller';

const router = Router();

// Bootstrapping: seeding uses its own header-key check (creates the first admin),
// so it must stay OUTSIDE the requireAdmin gate below.
router.post('/seed', adminController.runSeed);

// Everything below is admin-only (loads role from the DB per request).
router.use(protect, requireAdmin);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.listUsers);
router.patch('/users/:id/role', adminController.setUserRole);
router.get('/deployments', adminController.listDeployments);
router.get('/activity', adminController.recentActivity);
router.get('/usage', adminController.getUsage);

export default router;
