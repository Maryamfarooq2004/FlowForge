import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

const JWT_CONFIG = {
  issuer: 'flowforge-api',
  audience: 'flowforge-client',
};

export const signAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '8h',
    ...JWT_CONFIG,
  });
};

export const signRefreshToken = (userId: string): { token: string; tokenId: string } => {
  const tokenId = uuidv4();
  const token = jwt.sign(
    { userId, tokenId }, 
    process.env.JWT_REFRESH_SECRET!, 
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
      ...JWT_CONFIG,
    }
  );
  return { token, tokenId };
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!, {
    ...JWT_CONFIG,
  }) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!, {
    ...JWT_CONFIG,
  }) as RefreshTokenPayload;
};
