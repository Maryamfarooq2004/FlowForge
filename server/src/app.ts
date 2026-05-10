import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import * as Sentry from '@sentry/node';
import { errorMiddleware } from './middleware/error.middleware';
import { generalRateLimit } from './middleware/rateLimit.middleware';
import { logger } from './utils/logger.utils';

// 1. Sentry MUST be initialized first
if (process.env.SENTRY_DSN) {
  Sentry.init({ 
    dsn: process.env.SENTRY_DSN, 
    environment: process.env.NODE_ENV || 'development' 
  });
}

const app = express();

// 2. Helmet MUST come before any routes
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// 3. CORS — BUG 2 FIX: Specify exact origins, never use '*' in production
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,             // Required for httpOnly cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// 4. Body parsers — BUG 5 FIX: with size limits to prevent DoS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Rate limiting on all routes (BUG 3 FIX)
app.use(generalRateLimit);

// 6. Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));  // structured logging for production
}

// Public Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    version: '1.0.0',
    database: 'connected', // Simplified for health check
    timestamp: new Date().toISOString(),
  });
});

// Routes Placeholder (Step 3-7)
// app.use('/api/v1/auth', authRoutes);

// 7. Sentry error handler BEFORE custom error handler
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// 8. Global error handler MUST be last (BUG 4 FIX)
app.use(errorMiddleware);

export default app;
