import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { uploadDocuments, catchUpload } from '../middleware/upload.middleware';
import * as dc from '../controllers/document.controller';

const router = Router();
router.use(protect);

router.post('/:projectId/upload', catchUpload(uploadDocuments), dc.upload);
router.get('/:projectId', dc.list);
router.post('/:projectId/merge', dc.merge);
router.delete('/:projectId/:docId', dc.remove);

export default router;
