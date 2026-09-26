import { IR } from '../types';
import { banner, lines, withTrailingNewline } from './helpers';

const dbName = (ir: IR) => `flowforge_${ir.domain}`;

// ── src/config/database.ts ─────────────────────────────────────────
export const renderDatabaseConfig = (ir: IR): string =>
  withTrailingNewline(
    lines(
      banner('Sequelize connection.'),
      `import { Sequelize } from 'sequelize';`,
      `import dotenv from 'dotenv';`,
      ``,
      `dotenv.config();`,
      ``,
      `const databaseUrl =`,
      `  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/${dbName(ir)}';`,
      ``,
      `export const sequelize = new Sequelize(databaseUrl, {`,
      `  dialect: 'postgres',`,
      `  logging: false,`,
      `});`,
      ``,
      `export default sequelize;`
    )
  );

// ── src/utils/AppError.ts ──────────────────────────────────────────
export const renderAppError = (): string =>
  withTrailingNewline(
    lines(
      banner('Operational error carrying an HTTP status + code.'),
      `export class AppError extends Error {`,
      `  statusCode: number;`,
      `  code: string;`,
      `  isOperational: boolean;`,
      ``,
      `  constructor(message: string, statusCode = 400, code = 'APP_ERROR') {`,
      `    super(message);`,
      `    this.statusCode = statusCode;`,
      `    this.code = code;`,
      `    this.isOperational = true;`,
      `    Object.setPrototypeOf(this, AppError.prototype);`,
      `  }`,
      `}`,
      ``,
      `export default AppError;`
    )
  );

// ── src/utils/response.util.ts ─────────────────────────────────────
export const renderResponseUtil = (): string =>
  withTrailingNewline(
    lines(
      banner('Standard response envelope helpers.'),
      `import { Response } from 'express';`,
      ``,
      `export const sendSuccess = (res: Response, status: number, data: unknown): void => {`,
      `  res.status(status).json({ success: true, data });`,
      `};`,
      ``,
      `export const sendError = (res: Response, status: number, code: string, message: string): void => {`,
      `  res.status(status).json({ success: false, code, message });`,
      `};`
    )
  );

// ── src/middleware/auth.middleware.ts ──────────────────────────────
export const renderAuthMiddleware = (): string =>
  withTrailingNewline(
    lines(
      banner('JWT authentication — sets req.user = { id, role }.'),
      `import { Request, Response, NextFunction } from 'express';`,
      `import jwt from 'jsonwebtoken';`,
      ``,
      `const JWT_SECRET: string = process.env.JWT_SECRET || 'dev-secret-change-me';`,
      ``,
      `export interface AuthUser { id: number; role: string; }`,
      ``,
      `export const protect = (req: Request, res: Response, next: NextFunction): void => {`,
      `  const authHeader = req.headers.authorization;`,
      `  if (!authHeader || !authHeader.startsWith('Bearer ')) {`,
      `    res.status(401).json({ success: false, code: 'NO_TOKEN', message: 'Authentication required.' });`,
      `    return;`,
      `  }`,
      `  const token = authHeader.split(' ')[1];`,
      `  try {`,
      `    const payload = jwt.verify(token, JWT_SECRET) as { id: number; role: string };`,
      `    (req as any).user = { id: payload.id, role: payload.role };`,
      `    next();`,
      `  } catch {`,
      `    res.status(401).json({ success: false, code: 'INVALID_TOKEN', message: 'Invalid or expired token.' });`,
      `  }`,
      `};`
    )
  );

// ── src/middleware/rbac.middleware.ts ──────────────────────────────
export const renderRbacMiddleware = (): string =>
  withTrailingNewline(
    lines(
      banner('Role guard — mirrors the platform pattern; reads role from the JWT.'),
      `import { Request, Response, NextFunction } from 'express';`,
      ``,
      `export const requireRole = (...roles: string[]) => {`,
      `  return (req: Request, res: Response, next: NextFunction): void => {`,
      `    const user = (req as any).user as { id: number; role: string } | undefined;`,
      `    if (!user || !roles.includes(user.role)) {`,
      `      res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'You do not have permission to perform this action.' });`,
      `      return;`,
      `    }`,
      `    next();`,
      `  };`,
      `};`
    )
  );

// ── src/middleware/validate.middleware.ts ──────────────────────────
export const renderValidateMiddleware = (): string =>
  withTrailingNewline(
    lines(
      banner('Terminal express-validator middleware.'),
      `import { Request, Response, NextFunction } from 'express';`,
      `import { validationResult } from 'express-validator';`,
      ``,
      `export const validate = (req: Request, res: Response, next: NextFunction): void => {`,
      `  const result = validationResult(req);`,
      `  if (!result.isEmpty()) {`,
      `    const errors = result.array().map((e) => ({`,
      `      field: e.type === 'field' ? e.path : undefined,`,
      `      message: e.msg as string,`,
      `    }));`,
      `    res.status(422).json({ success: false, code: 'VALIDATION_ERROR', message: 'Validation failed.', errors });`,
      `    return;`,
      `  }`,
      `  next();`,
      `};`
    )
  );

// ── src/middleware/error.middleware.ts ─────────────────────────────
export const renderErrorMiddleware = (): string =>
  withTrailingNewline(
    lines(
      banner('Global error handler.'),
      `import { Request, Response, NextFunction } from 'express';`,
      `import { AppError } from '../utils/AppError';`,
      ``,
      `export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction): void => {`,
      `  if (err instanceof AppError && err.isOperational) {`,
      `    res.status(err.statusCode).json({ success: false, code: err.code, message: err.message });`,
      `    return;`,
      `  }`,
      `  console.error('Unhandled error:', err);`,
      `  res.status(500).json({ success: false, code: 'INTERNAL_ERROR', message: 'Something went wrong.' });`,
      `};`
    )
  );

// ── src/models/User.model.ts ───────────────────────────────────────
export const renderUserModel = (): string =>
  withTrailingNewline(
    lines(
      banner('Authentication user model.'),
      `import { DataTypes, Model } from 'sequelize';`,
      `import { sequelize } from '../config/database';`,
      ``,
      `export class User extends Model {}`,
      ``,
      `User.init(`,
      `  {`,
      `    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },`,
      `    email: { type: DataTypes.STRING(255), allowNull: false, unique: true, field: 'email' },`,
      `    password: { type: DataTypes.STRING(255), allowNull: false, field: 'password' },`,
      `    fullName: { type: DataTypes.STRING(255), allowNull: true, field: 'full_name' },`,
      `    role: { type: DataTypes.STRING(64), allowNull: false, field: 'role' },`,
      `  },`,
      `  { sequelize, modelName: 'User', tableName: 'users', underscored: true, timestamps: true }`,
      `);`,
      ``,
      `export default User;`
    )
  );

// ── src/services/auth.service.ts ───────────────────────────────────
export const renderAuthService = (): string =>
  withTrailingNewline(
    lines(
      banner('Registration & login.'),
      `import bcrypt from 'bcrypt';`,
      `import jwt from 'jsonwebtoken';`,
      `import { User } from '../models/User.model';`,
      `import { AppError } from '../utils/AppError';`,
      `import { ROLE_KEYS } from '../config/roles';`,
      ``,
      `const JWT_SECRET: string = process.env.JWT_SECRET || 'dev-secret-change-me';`,
      `const JWT_EXPIRES = process.env.JWT_EXPIRES || '30m';`,
      ``,
      `const sanitize = (user: any) => ({`,
      `  id: user.id,`,
      `  email: user.email,`,
      `  fullName: user.fullName,`,
      `  role: user.role,`,
      `});`,
      ``,
      `export const registerUser = async (data: { email: string; password: string; fullName?: string; role: string }) => {`,
      `  const existing = await User.findOne({ where: { email: data.email } });`,
      `  if (existing) throw new AppError('An account with this email already exists.', 409, 'DUPLICATE');`,
      `  if (!ROLE_KEYS.includes(data.role as any)) throw new AppError('Invalid role.', 400, 'INVALID_ROLE');`,
      `  const hash = await bcrypt.hash(data.password, 10);`,
      `  const user = await User.create({ email: data.email, password: hash, fullName: data.fullName, role: data.role });`,
      `  return sanitize(user);`,
      `};`,
      ``,
      `export const loginUser = async (data: { email: string; password: string }) => {`,
      `  const user = await User.findOne({ where: { email: data.email } });`,
      `  if (!user) throw new AppError('Invalid credentials.', 401, 'INVALID_CREDENTIALS');`,
      `  const valid = await bcrypt.compare(data.password, String((user as any).password));`,
      `  if (!valid) throw new AppError('Invalid credentials.', 401, 'INVALID_CREDENTIALS');`,
      `  const token = jwt.sign(`,
      `    { id: (user as any).id, role: (user as any).role },`,
      `    JWT_SECRET,`,
      `    { expiresIn: JWT_EXPIRES } as jwt.SignOptions`,
      `  );`,
      `  return { token, user: sanitize(user) };`,
      `};`
    )
  );

// ── src/controllers/auth.controller.ts ─────────────────────────────
export const renderAuthController = (): string =>
  withTrailingNewline(
    lines(
      banner('Auth HTTP handlers.'),
      `import { Request, Response, NextFunction } from 'express';`,
      `import * as authService from '../services/auth.service';`,
      ``,
      `export const register = async (req: Request, res: Response, next: NextFunction) => {`,
      `  try {`,
      `    const user = await authService.registerUser(req.body);`,
      `    res.status(201).json({ success: true, data: { user } });`,
      `  } catch (err) { next(err); }`,
      `};`,
      ``,
      `export const login = async (req: Request, res: Response, next: NextFunction) => {`,
      `  try {`,
      `    const result = await authService.loginUser(req.body);`,
      `    res.json({ success: true, data: result });`,
      `  } catch (err) { next(err); }`,
      `};`
    )
  );

// ── src/routes/auth.routes.ts ──────────────────────────────────────
export const renderAuthRoutes = (): string =>
  withTrailingNewline(
    lines(
      banner('Auth routes (mounted at /api/auth).'),
      `import { Router } from 'express';`,
      `import { body } from 'express-validator';`,
      `import { validate } from '../middleware/validate.middleware';`,
      `import * as ctrl from '../controllers/auth.controller';`,
      ``,
      `const router = Router();`,
      ``,
      `router.post(`,
      `  '/register',`,
      `  [body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 6 }), body('role').isString()],`,
      `  validate,`,
      `  ctrl.register`,
      `);`,
      ``,
      `router.post(`,
      `  '/login',`,
      `  [body('email').isEmail().normalizeEmail(), body('password').isString()],`,
      `  validate,`,
      `  ctrl.login`,
      `);`,
      ``,
      `export default router;`
    )
  );

// ── src/app.ts ─────────────────────────────────────────────────────
export const renderAppTs = (): string =>
  withTrailingNewline(
    lines(
      banner('Express application.'),
      `import express from 'express';`,
      `import cors from 'cors';`,
      `import helmet from 'helmet';`,
      `import routes from './routes';`,
      `import { errorHandler } from './middleware/error.middleware';`,
      ``,
      `export const createApp = () => {`,
      `  const app = express();`,
      `  app.use(cors());`,
      `  app.use(helmet());`,
      `  app.use(express.json());`,
      ``,
      `  app.get('/health', (_req, res) => {`,
      `    res.json({ status: 'ok' });`,
      `  });`,
      ``,
      `  app.use('/api', routes);`,
      ``,
      `  app.use((_req, res) => {`,
      `    res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Route not found.' });`,
      `  });`,
      ``,
      `  app.use(errorHandler);`,
      `  return app;`,
      `};`,
      ``,
      `export default createApp;`
    )
  );

// ── src/server.ts ──────────────────────────────────────────────────
export const renderServerTs = (): string =>
  withTrailingNewline(
    lines(
      banner('Server entry point.'),
      `import dotenv from 'dotenv';`,
      `dotenv.config();`,
      ``,
      `import { createApp } from './app';`,
      `import { sequelize } from './config/database';`,
      `import './models';`,
      ``,
      `const PORT = Number(process.env.PORT) || 4000;`,
      ``,
      `const start = async () => {`,
      `  try {`,
      `    await sequelize.authenticate();`,
      `    const app = createApp();`,
      `    app.listen(PORT, () => {`,
      "      console.log(`Server listening on port ${PORT}`);",
      `    });`,
      `  } catch (err) {`,
      `    console.error('Failed to start server:', err);`,
      `    process.exit(1);`,
      `  }`,
      `};`,
      ``,
      `void start();`
    )
  );

// ── package.json ───────────────────────────────────────────────────
export const renderPackageJson = (ir: IR): string => {
  const pkg = {
    name: ir.appName,
    version: '1.0.0',
    private: true,
    description: `Generated by FlowForge from an approved ${ir.domain} workflow spec.`,
    scripts: {
      build: 'tsc',
      start: 'node dist/server.js',
      dev: 'ts-node src/server.ts',
      migrate: 'sequelize-cli db:migrate',
      'migrate:undo': 'sequelize-cli db:migrate:undo:all',
    },
    dependencies: {
      bcrypt: '^5.1.1',
      cors: '^2.8.5',
      dotenv: '^16.4.5',
      express: '^4.19.2',
      'express-validator': '^7.1.0',
      helmet: '^7.1.0',
      jsonwebtoken: '^9.0.2',
      pg: '^8.12.0',
      'pg-hstore': '^2.3.4',
      sequelize: '^6.37.3',
    },
    devDependencies: {
      '@types/bcrypt': '^5.0.2',
      '@types/cors': '^2.8.17',
      '@types/express': '^4.17.21',
      '@types/jsonwebtoken': '^9.0.6',
      '@types/node': '^20.14.0',
      'sequelize-cli': '^6.6.2',
      'ts-node': '^10.9.2',
      typescript: '^5.5.0',
    },
  };
  return withTrailingNewline(JSON.stringify(pkg, null, 2));
};

// ── tsconfig.json ──────────────────────────────────────────────────
export const renderTsconfig = (): string => {
  const cfg = {
    compilerOptions: {
      target: 'ES2020',
      module: 'CommonJS',
      moduleResolution: 'node',
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };
  return withTrailingNewline(JSON.stringify(cfg, null, 2));
};

// ── .env.example ───────────────────────────────────────────────────
export const renderEnvExample = (ir: IR): string =>
  withTrailingNewline(
    lines(
      `DATABASE_URL=postgres://postgres:postgres@localhost:5432/${dbName(ir)}`,
      `JWT_SECRET=change-me-to-a-long-random-string`,
      `JWT_EXPIRES=30m`,
      `PORT=4000`
    )
  );

// ── .sequelizerc ───────────────────────────────────────────────────
export const renderSequelizerc = (): string =>
  withTrailingNewline(
    lines(
      `const path = require('path');`,
      `module.exports = {`,
      `  'config': path.resolve('config', 'sequelize.js'),`,
      `  'migrations-path': path.resolve('migrations'),`,
      `};`
    )
  );

// ── config/sequelize.js (sequelize-cli connection; outside src/) ───
export const renderSequelizeCliConfig = (ir: IR): string =>
  withTrailingNewline(
    lines(
      `require('dotenv').config();`,
      `const url = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/${dbName(ir)}';`,
      `module.exports = {`,
      `  development: { url, dialect: 'postgres' },`,
      `  test: { url, dialect: 'postgres' },`,
      `  production: { url: process.env.DATABASE_URL, dialect: 'postgres' },`,
      `};`
    )
  );

// ── .gitignore ─────────────────────────────────────────────────────
export const renderGitignore = (): string =>
  withTrailingNewline(lines(`node_modules`, `dist`, `.env`, `*.log`));

// ── docker-compose.yml (db + app) ──────────────────────────────────
export const renderDockerCompose = (ir: IR): string =>
  withTrailingNewline(
    lines(
      `services:`,
      `  db:`,
      `    image: postgres:16`,
      `    environment:`,
      `      POSTGRES_USER: postgres`,
      `      POSTGRES_PASSWORD: postgres`,
      `      POSTGRES_DB: ${dbName(ir)}`,
      `    ports:`,
      `      - '5432:5432'`,
      `    volumes:`,
      `      - db_data:/var/lib/postgresql/data`,
      `  app:`,
      `    build: .`,
      `    depends_on:`,
      `      - db`,
      `    environment:`,
      `      DATABASE_URL: postgres://postgres:postgres@db:5432/${dbName(ir)}`,
      `      JWT_SECRET: change-me-to-a-long-random-string`,
      `      JWT_EXPIRES: 30m`,
      `      PORT: '4000'`,
      `    ports:`,
      `      - '4000:4000'`,
      `  client:`,
      `    build: ./client`,
      `    depends_on:`,
      `      - app`,
      `    ports:`,
      `      - '5173:80'`,
      `volumes:`,
      `  db_data:`
    )
  );

// ── README.md ──────────────────────────────────────────────────────
export const renderReadme = (ir: IR): string => {
  const entityList = ir.entities.map((e) => `- **${e.label}** (\`${e.tableName}\`)`).join('\n');
  const roleList = ir.roles.map((r) => `- **${r.name}** (\`${r.key}\`)`).join('\n');
  const wf = ir.workflow
    ? lines(
        ``,
        `## Workflow`,
        ``,
        `\`${ir.workflow.entityModel}\` moves through: ${ir.workflow.states.map((s) => s.label).join(' → ')}.`,
        `Advance it via \`POST /api/${ir.workflow.entityRouteBase}/:id/transition\` with \`{ "to": "<stateKey>" }\`.`
      )
    : '';

  const body = lines(
    `# ${ir.appName}`,
    ``,
    `Generated by **FlowForge** from an approved ${ir.domain} workflow specification.`,
    ``,
    `## Stack`,
    ``,
    `- Node.js + Express + TypeScript (API, at the project root)`,
    `- PostgreSQL + Sequelize (numbered migrations)`,
    `- JWT auth + role-based access control`,
    `- React + Vite + TypeScript frontend (in \`client/\`)`,
    ``,
    `## Getting started (backend API)`,
    ``,
    '```bash',
    `npm install`,
    `cp .env.example .env   # then edit DATABASE_URL / JWT_SECRET`,
    `docker compose up -d   # starts PostgreSQL`,
    `npm run migrate        # create the schema`,
    `npm run dev            # start the API on :4000`,
    '```',
    ``,
    `## Getting started (frontend)`,
    ``,
    '```bash',
    `cd client`,
    `npm install`,
    `cp .env.example .env   # set VITE_API_URL (default http://localhost:4000/api)`,
    `npm run dev            # start the app on :5173`,
    '```',
    ``,
    `Register a user via the API (\`POST /api/auth/register\` with an email, password, and a \`role\` from the list below), then sign in through the app. Or run the whole stack with \`docker compose up\` (db + api + client on :5173).`,
    ``,
    `## Data collections`,
    ``,
    entityList,
    ``,
    `## Roles`,
    ``,
    roleList,
    wf,
    ``,
    `> Note: \`NUMERIC\`/currency columns are returned by \`pg\` as strings to preserve precision.`,
    ``,
    `Licensed under MIT.`
  );
  return withTrailingNewline(body);
};
