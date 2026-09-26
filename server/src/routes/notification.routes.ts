import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import * as nc from '../controllers/notification.controller';

const router = Router();
router.use(protect);

router.get('/unread-count', nc.unreadCount);
router.post('/read-all', nc.markAllRead);
router.get('/config/:projectId', nc.getConfig);
router.put('/config/:projectId', nc.saveConfig);
router.get('/', nc.list);
router.patch('/:id/read', nc.markRead);

export default router;
