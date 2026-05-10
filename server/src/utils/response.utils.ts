import { Response } from 'express';

export const sendSuccess = <T>(
  res: Response, 
  data: T, 
  message = 'Success', 
  statusCode = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const sendError = (
  res: Response, 
  error: string, 
  statusCode = 400,
  details?: unknown
) => {
  res.status(statusCode).json({
    success: false,
    error,
    ...(details && process.env.NODE_ENV !== 'production' ? { details } : {}),
    timestamp: new Date().toISOString(),
  });
};
