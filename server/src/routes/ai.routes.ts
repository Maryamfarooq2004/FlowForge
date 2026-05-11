import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { getSuggestionsService } from '../services/ai.service';

const router = Router();

// All AI routes are protected
router.use(protect);

router.post('/suggestions', async (req, res, next) => {
  try {
    const { content, screenSlug, domain } = req.body;
    
    if (!screenSlug || !domain) {
      return res.status(400).json({
        success: false,
        message: 'screenSlug and domain are required.',
      });
    }

    const suggestions = await getSuggestionsService(content || '', screenSlug, domain);
    
    res.json({
      success: true,
      data: { suggestions },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
