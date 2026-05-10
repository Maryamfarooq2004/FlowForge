import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { logger } from '../utils/logger.utils';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string | number;
}

export const errorMiddleware = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message;
  let code = err.code;

  // Handle MongoDB Duplicate Key Error (BUG 2 (a))
  if (err.code === 11000) {
    statusCode = 409;
    code = 'EMAIL_ALREADY_EXISTS';
    message = 'An account with this email already exists.';
  }

  // Handle Mongoose Validation Error (BUG 2 (b))
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = Object.values((err as any).errors || {}).map((e: any) => e.message).join(', ') || 'Validation error';
  }

  // Handle Mongoose Cast Error (BUG 2 (b))
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'CAST_ERROR';
    message = 'Invalid ID or data format';
  }
  
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
    code: code || undefined,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
