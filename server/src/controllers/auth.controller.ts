import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response.utils';

const ACCESS_TOKEN_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 8 * 60 * 60 * 1000, // 8 hours
};

const REFRESH_TOKEN_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.registerUser(req.body);
    sendSuccess(res, null, result.message, 201);
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.query;
    if (!token) return sendError(res, 'Token is required', 400);
    
    const result = await authService.verifyEmail(token as string);
    sendSuccess(res, null, result.message);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, accessToken, refreshToken } = await authService.loginUser(req.body);
    
    res.cookie('accessToken', accessToken, ACCESS_TOKEN_OPTIONS);
    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_OPTIONS);
    
    sendSuccess(res, { user }, 'Login successful');
  } catch (error) {
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
    
    sendSuccess(res, null, 'Token refreshed');
  } catch (error) {
    // Clear cookies on refresh failure
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
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

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};
