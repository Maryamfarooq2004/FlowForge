import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../utils/jwt.utils';
import { User } from '../models/User.model';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken;
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }
  
  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found.' });
    }
    
    // Attach user to request
    (req as any).user = user;
    next();
  } catch (err: any) {
    // SECURITY: Distinguish between expired and invalid tokens
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token expired.', 
        code: 'TOKEN_EXPIRED' 
      });
    }
    return res.status(401).json({ success: false, error: 'Invalid token.' });
  }
};
