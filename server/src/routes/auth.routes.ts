import { Router, Request, Response, NextFunction } from 'express';
import * as authController from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { uploadLogo } from '../middleware/upload.middleware';
import { authRateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

// Run multer and convert its errors into a clean 400 envelope.
const handleLogoUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadLogo(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        success: false,
        code: 'UPLOAD_ERROR',
        message: err.message || 'Logo upload failed.',
      });
    }
    next();
  });
};

// Public routes (auth endpoints use the shared stricter limiter)
router.post('/register', authRateLimit, authController.register);
router.post('/login', authRateLimit, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/refresh', authController.refreshToken); // Legacy/Alias support
router.post('/logout', authController.logout);
router.post('/forgot-password', authRateLimit, authController.forgotPassword);
router.post('/reset-password', authRateLimit, authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);

// Protected routes
router.get('/me', protect, authController.getMe);
router.patch('/profile', protect, authController.updateProfile);
router.patch('/change-password', protect, authController.changePassword);
router.post('/resend-verification', protect, authRateLimit, authController.resendVerification);
router.post('/logo', protect, handleLogoUpload, authController.uploadLogo);

export default router;
