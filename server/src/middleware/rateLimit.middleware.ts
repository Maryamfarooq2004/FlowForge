import rateLimit from 'express-rate-limit';
import type { Request } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';

// Canonical home for reusable route rate limiters. Envelope matches the
// app-standard { success, code, message } shape used everywhere else.

/**
 * Key authenticated requests by USER id (from the access token) rather than IP,
 * so (a) an active single-page app that polls notifications every 30s and streams
 * generation progress doesn't exhaust a shared budget, and (b) many users behind
 * one office/NAT IP don't throttle each other. Falls back to IP for anonymous
 * traffic (public pages / pre-login), which is where DoS risk actually lives.
 */
const userOrIpKey = (req: Request): string => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const { userId } = verifyAccessToken(header.slice(7));
      if (userId) return `u:${userId}`;
    } catch {
      // expired/invalid token → fall through to IP key
    }
  }
  return `ip:${req.ip || 'unknown'}`;
};

// General API traffic. Per-user (or per-IP when anonymous). Generous by default
// because this covers an authenticated SPA that polls; override via env if needed.
// The strict brute-force / abuse limits live on the auth + upload limiters below.
const GENERAL_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const GENERAL_MAX = Number(process.env.RATE_LIMIT_MAX) || 1000;

export const generalRateLimit = rateLimit({
  windowMs: GENERAL_WINDOW_MS,
  max: GENERAL_MAX,
  keyGenerator: userOrIpKey,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  message: { success: false, code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' },
});

// Auth endpoints: 15 attempts per 15 minutes (brute force protection)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  keyGenerator: (req) => (req.body?.email as string)?.toLowerCase() || req.ip || 'unknown',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  message: { success: false, code: 'RATE_LIMITED', message: 'Too many attempts. Please try again in 15 minutes.' },
});

// File upload: 10 uploads per hour
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  message: { success: false, code: 'RATE_LIMITED', message: 'Upload limit reached. Try again in an hour.' },
});
