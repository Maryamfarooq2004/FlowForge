import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

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
    let { fullName, email, orgType, organizationType, password } = req.body;

    // Support both field names for compatibility with cached frontend versions
    if (!orgType && organizationType) orgType = organizationType;

    if (!fullName || !email || !orgType || !password) {
      res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'fullName, email, orgType, and password are all required.',
      });
      return;
    }

    const result = await authService.registerService(fullName, email, orgType, password);

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
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
