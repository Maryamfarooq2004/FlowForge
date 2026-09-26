import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';

/**
 * Role-based access guard. Must run AFTER `protect` (which sets req.userId).
 * Loads the user's role and rejects with 403 if it isn't in the allowed set.
 * Attaches the loaded user to req.user for downstream handlers.
 *
 * Usage: router.use(protect, requireRole('admin'))
 */
export const requireRole = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).userId as string | undefined;
      if (!userId) {
        res.status(401).json({
          success: false,
          code: 'NO_TOKEN',
          message: 'Authentication required. Please log in.',
        });
        return;
      }

      const user = await User.findById(userId).select('role email fullName');
      if (!user) {
        res.status(401).json({
          success: false,
          code: 'USER_NOT_FOUND',
          message: 'Account no longer exists.',
        });
        return;
      }

      if (!roles.includes((user as any).role)) {
        res.status(403).json({
          success: false,
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.',
        });
        return;
      }

      (req as any).user = user;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/** Shorthand for admin-only routes. */
export const requireAdmin = requireRole('admin');
