import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Auth-specific rate limiter (stricter than global)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  keyGenerator: (req) => {
    // Key by email if provided, otherwise by IP
    return (req.body?.email as string)?.toLowerCase() || req.ip || 'unknown';
  },
  message: {
    success: false,
    code: 'RATE_LIMITED',
    message: 'Too many attempts. Please wait 15 minutes before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
});

// Public routes
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/refresh', authController.refreshToken); // Legacy/Alias support
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', protect, authController.getMe);

export default router;
