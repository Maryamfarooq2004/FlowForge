import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { logAudit } from '../utils/audit.utils';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,  // REQUIRED for cross-domain (Railway + Vercel)
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

const clearCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  path: '/',
};

// ── POST /auth/register ────────────────────────────

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { fullName, email, organizationType, orgType, password } = req.body;

    // Handle legacy mapping if needed (defense in depth)
    if (!organizationType && orgType) organizationType = orgType;

    if (!fullName || !email || !organizationType || !password) {
      res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'fullName, email, organizationType, and password are all required.',
      });
      return;
    }

    const result = await authService.registerService(
      fullName,
      email,
      organizationType,
      password
    );

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });

    logAudit({ userId: result.user.id, action: 'USER_REGISTER', ip: req.ip });
  } catch (err) {
    next(err);
  }
};

// ── POST /auth/login ───────────────────────────────

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'Email and password are required.',
      });
      return;
    }

    const ip = req.ip || req.socket.remoteAddress;
    const result = await authService.loginService(email, password, ip);

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });

    logAudit({ userId: result.user.id, action: 'USER_LOGIN', ip: req.ip });
  } catch (err) {
    next(err);
  }
};

// ── POST /auth/refresh-token ───────────────────────

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Read from httpOnly cookie
    const token = req.cookies?.refreshToken;

    if (!token) {
      res.status(401).json({
        success: false,
        code: 'NO_REFRESH_TOKEN',
        message: 'No refresh token found.',
      });
      return;
    }

    const result = await authService.refreshTokenService(token);

    // Set new refresh token cookie
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (err) {
    // Clear cookie on failure
    res.clearCookie('refreshToken', clearCookieOptions);
    next(err);
  }
};

// ── POST /auth/logout ──────────────────────────────

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;
    await authService.logoutService(token);
    res.clearCookie('refreshToken', clearCookieOptions);
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    res.clearCookie('refreshToken', clearCookieOptions);
    next(err);
  }
};

// ── GET /auth/me ───────────────────────────────────

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // req.userId is set by the protect middleware
    const user = await authService.getMeService((req as any).userId);
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /auth/profile ────────────────────────────

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fullName, businessName, logoUrl } = req.body;
    const user = await authService.updateProfileService((req as any).userId, {
      fullName,
      businessName,
      logoUrl,
    });
    res.status(200).json({ success: true, message: 'Profile updated.', data: { user } });
    logAudit({ userId: (req as any).userId, action: 'PROFILE_UPDATE', ip: req.ip });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /auth/change-password ────────────────────

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePasswordService(
      (req as any).userId,
      currentPassword,
      newPassword
    );
    res.status(200).json({ success: true, message: 'Password changed successfully.' });
    logAudit({ userId: (req as any).userId, action: 'PASSWORD_CHANGE', ip: req.ip });
  } catch (err) {
    next(err);
  }
};

// ── POST /auth/forgot-password ─────────────────────

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    await authService.forgotPasswordService(email);
    // Generic response regardless of whether the email exists.
    res.status(200).json({
      success: true,
      message: 'If that email is registered, a reset link has been sent.',
    });
    logAudit({ action: 'PASSWORD_RESET_REQUEST', ip: req.ip, meta: { email } });
  } catch (err) {
    next(err);
  }
};

// ── POST /auth/reset-password ──────────────────────

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPasswordService(token, newPassword);
    res.status(200).json({ success: true, message: 'Password reset successfully.' });
    logAudit({ action: 'PASSWORD_RESET', ip: req.ip });
  } catch (err) {
    next(err);
  }
};

// ── POST /auth/verify-email ────────────────────────

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({
        success: false,
        code: 'MISSING_TOKEN',
        message: 'A verification token is required.',
      });
      return;
    }
    const user = await authService.verifyEmailService(token);
    res.status(200).json({
      success: true,
      message: 'Email verified successfully.',
      data: { user },
    });
    logAudit({ userId: user.id, action: 'EMAIL_VERIFIED', ip: req.ip });
  } catch (err) {
    next(err);
  }
};

// ── POST /auth/resend-verification ─────────────────

export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.resendVerificationService((req as any).userId);
    res.status(200).json({
      success: true,
      message: result.alreadyVerified
        ? 'Your email is already verified.'
        : 'Verification email sent. Please check your inbox.',
      data: { alreadyVerified: result.alreadyVerified },
    });
    if (!result.alreadyVerified) {
      logAudit({ userId: (req as any).userId, action: 'VERIFICATION_RESENT', ip: req.ip });
    }
  } catch (err) {
    next(err);
  }
};

// ── POST /auth/logo ────────────────────────────────
// (multer has already parsed the file into req.file by the time we reach here)

export const uploadLogo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = (req as any).file as { filename: string } | undefined;
    if (!file) {
      res.status(400).json({ success: false, code: 'NO_FILE', message: 'No logo file uploaded.' });
      return;
    }
    const logoUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
    const user = await authService.updateProfileService((req as any).userId, { logoUrl });
    res.status(200).json({ success: true, message: 'Logo updated.', data: { user } });
    logAudit({ userId: (req as any).userId, action: 'LOGO_UPLOAD', ip: req.ip });
  } catch (err) {
    next(err);
  }
};
