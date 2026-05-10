import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authRateLimit, resendRateLimit } from '../middleware/rateLimit.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', authController.register);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', resendRateLimit, authController.resendVerification);
router.post('/login', authRateLimit, authController.login);
router.post('/refresh', authController.refresh);
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', authRateLimit, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
