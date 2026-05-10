import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      code: 'NO_TOKEN',
      message: 'Authentication required. Please log in.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token || token === 'null' || token === 'undefined') {
    res.status(401).json({
      success: false,
      code: 'NO_TOKEN',
      message: 'Authentication required. Please log in.',
    });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    (req as any).userId = payload.userId;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      code: err.code || 'INVALID_TOKEN',
      message: err.message || 'Invalid or expired token.',
    });
  }
};
