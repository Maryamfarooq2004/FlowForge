import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import intakeRoutes from './routes/intake.routes';
import projectRoutes from './routes/project.routes';
import aiRoutes from './routes/ai.routes';

export const createApp = (): Application => {
  const app = express();

  // ── STEP 1: Trust Railway proxy (REQUIRED for rate limiting & IP detection)
  app.set('trust proxy', 1);

  // ── STEP 2: CORS — MUST be first, before everything else
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['X-New-Access-Token'],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));

  // Handle ALL preflight requests immediately
  app.options('*', cors());

  // ── STEP 3: Security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  }));

  // ── STEP 4: Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // DEBUG MIDDLEWARE: Log all requests
  app.use((req, res, next) => {
    if (req.method !== 'OPTIONS') {
      console.log(`[DEBUG] ${req.method} ${req.url}`);
      if (req.body && Object.keys(req.body).length > 0) {
        const safeBody = { ...req.body };
        if (safeBody.password) safeBody.password = '***';
        console.log(`[DEBUG] Body:`, JSON.stringify(safeBody));
      }
    }
    next();
  });

  // ── STEP 5: Cookie parsing (REQUIRED for refresh token cookie)
  app.use(cookieParser());

  // ── STEP 6: NoSQL injection protection
  app.use(mongoSanitize());

  // ── STEP 7: Rate limiting (global)
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, code: 'RATE_LIMITED', message: 'Too many requests.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS'
  }));

  // ── STEP 8: Health check (before routes — never fails)
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  });

  // ── STEP 9: Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/intake', intakeRoutes);
  app.use('/api/v1/projects', projectRoutes);
  app.use('/api/v1/ai', aiRoutes);
  // Nested route: /api/v1/projects/:projectId/intake
  app.use('/api/v1/projects/:projectId/intake', intakeRoutes);

  // ── STEP 9.5: Serve static frontend files
  const publicPath = path.join(__dirname, '../public');
  app.use(express.static(publicPath));

  // Catch-all for SPA routing (redirect all non-API requests to index.html)
  app.get('*', (req, res, next) => {
    // If it starts with /api, skip to 404 handler
    if (req.url.startsWith('/api')) return next();
    res.sendFile(path.join(publicPath, 'index.html'));
  });

  // ── STEP 10: 404 handler for API only
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found.`
    });
  });

  // ── STEP 11: Global error handler (MUST be last)
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Global error:', {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      url: req.originalUrl,
      method: req.method,
      body: req.method !== 'GET' ? req.body : undefined
    });

    // CORS errors
    if (err.message?.includes('CORS policy')) {
      return res.status(403).json({
        success: false,
        code: 'CORS_ERROR',
        message: 'Cross-origin request blocked.'
      });
    }

    // MongoDB duplicate key
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'field';
      const message = field === 'email'
        ? 'An account with this email already exists.'
        : `Duplicate value for ${field}.`;
      return res.status(409).json({ success: false, code: 'DUPLICATE_KEY', message });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const errors: Record<string, string> = {};
      Object.keys(err.errors).forEach(key => {
        errors[key] = err.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed.',
        errors
      });
    }

    // Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        code: 'INVALID_ID',
        message: 'Invalid ID format.'
      });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token.'
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Authentication token has expired.'
      });
    }

    // AppError (custom errors thrown from services)
    if (err.isOperational) {
      return res.status(err.statusCode || 400).json({
        success: false,
        code: err.code || 'APP_ERROR',
        message: err.message
      });
    }

    // Unknown errors — never expose internals in production
    return res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong. Please try again.'
    });
  });

  return app;
};
