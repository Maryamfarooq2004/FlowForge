import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { logger } from '../utils/logger.utils';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorMiddleware = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  
  // Log all errors internally
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // SECURITY: Never send stack traces to client in production
  if (process.env.NODE_ENV === 'production') {
    if (statusCode === 500) {
      // Generic message for unexpected errors
      res.status(500).json({
        success: false,
        error: 'An internal server error occurred.',
        requestId: req.headers['x-request-id'] || 'unknown',
      });
      return;
    }
  }

  res.status(statusCode).json({
    success: false,
    error: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
