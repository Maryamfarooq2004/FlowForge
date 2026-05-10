import rateLimit from 'express-rate-limit';

// General: 100 requests per 15 minutes
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});

// Auth endpoints: 10 attempts per 15 minutes (brute force protection)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => (req.body.email || req.ip).toString(),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, code: 'RATE_LIMITED', error: 'Too many attempts. Please try again in 15 minutes.' },
});

// Resend verification: 10 requests per 15 minutes (Relaxed for testing)
export const resendRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => (req.body.email || req.ip).toString(),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, code: 'RATE_LIMITED', error: 'Too many resend attempts. Please try again in 15 minutes.' },
});

// File upload: 10 uploads per hour
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Upload limit reached. Try again in an hour.' },
});
