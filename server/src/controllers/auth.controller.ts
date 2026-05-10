import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response.utils';

const ACCESS_TOKEN_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  maxAge: 8 * 60 * 60 * 1000, // 8 hours
};

const REFRESH_TOKEN_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, email, orgType, password } = req.body;
    console.log(`[Auth] Registration attempt for: ${email}`);

    if (!fullName || !email || !orgType || !password) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'All fields are required: fullName, email, orgType, password.'
      });
    }

    const result = await authService.register({ fullName, email, orgType, password });
    console.log(`[Auth] Registration SUCCESS for: ${email}`);

    res.cookie('refreshToken', result.refreshToken, REFRESH_TOKEN_OPTIONS);
    
    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    console.error(`[Auth] Registration ERROR:`, error);
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`[Auth] Login attempt for: ${req.body.email}`);
    const { user, accessToken, refreshToken } = await authService.loginUser(req.body);
    
    res.cookie('accessToken', accessToken, ACCESS_TOKEN_OPTIONS);
    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_OPTIONS);
    
    console.log(`[Auth] Login SUCCESS for: ${req.body.email}`);
    sendSuccess(res, { user, accessToken }, 'Login successful');
  } catch (error) {
    console.error(`[Auth] Login ERROR:`, error);
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const oldToken = req.cookies.refreshToken;
    if (!oldToken) return sendError(res, 'Refresh token missing', 401);

    const { accessToken, refreshToken } = await authService.rotateToken(oldToken);
    
    res.cookie('accessToken', accessToken, ACCESS_TOKEN_OPTIONS);
    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_OPTIONS);
    
    sendSuccess(res, { accessToken }, 'Token refreshed');
  } catch (error) {
    res.clearCookie('accessToken', { ...ACCESS_TOKEN_OPTIONS, maxAge: 0 });
    res.clearCookie('refreshToken', { ...REFRESH_TOKEN_OPTIONS, maxAge: 0 });
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return sendError(res, 'Not authenticated', 401);
    sendSuccess(res, { user }, 'User profile retrieved');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const userId = (req as any).user?._id;

    if (userId && refreshToken) {
      await authService.logoutUser(userId, refreshToken);
    }

    res.clearCookie('accessToken', { ...ACCESS_TOKEN_OPTIONS, maxAge: 0 });
    res.clearCookie('refreshToken', { ...REFRESH_TOKEN_OPTIONS, maxAge: 0 });
    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 'Email is required', 400);

    await authService.forgotPassword(email);
    sendSuccess(res, null, 'If an account exists with that email, a reset link has been sent.');
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return sendError(res, 'Token and password are required', 400);

    await authService.resetPassword(token, password);
    sendSuccess(res, null, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};
