import { Router } from 'express';
import * as projectController from '../controllers/project.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All project routes require authentication
router.use(protect);

router.get('/', projectController.listProjects);
router.get('/archived', projectController.listArchivedProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProject);
router.patch('/:id', projectController.updateProject);
router.post('/:id/archive', projectController.archiveProject);
router.post('/:id/duplicate', projectController.duplicateProject);
router.delete('/:id', projectController.deleteProject);

export default router;
