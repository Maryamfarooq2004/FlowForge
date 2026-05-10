import jwt from 'jsonwebtoken';
import { AppError } from './AppError';

interface TokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

const getSecret = (type: 'access' | 'refresh'): string => {
  const secret = type === 'access'
    ? process.env.JWT_ACCESS_SECRET
    : process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new AppError(`JWT ${type} secret not configured.`, 500, 'CONFIG_ERROR');
  }
  return secret;
};

export const generateAccessToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    getSecret('access'),
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '8h' } as jwt.SignOptions
  );
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    getSecret('refresh'),
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' } as jwt.SignOptions
  );
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, getSecret('access')) as TokenPayload;
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Access token expired.', 401, 'TOKEN_EXPIRED');
    }
    throw new AppError('Invalid access token.', 401, 'INVALID_TOKEN');
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, getSecret('refresh')) as TokenPayload;
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Refresh token expired. Please log in again.', 401, 'REFRESH_EXPIRED');
    }
    throw new AppError('Invalid refresh token.', 401, 'INVALID_REFRESH_TOKEN');
  }
};
