import { EntityIR, FieldIR, IR } from '../types';
import { RulePlan, entityRulePlan } from '../rules/ruleEngine';
import { camel } from '../naming';
import { banner, lines, indent, withTrailingNewline } from './helpers';

/** Fields writable via CRUD — the workflow status column is managed only via /transition. */
const writableFields = (e: EntityIR): FieldIR[] => e.fields.filter((f) => !f.isStatus);

/** camelCase collection key for response envelopes, e.g. "fee_plans" -> "feePlans". */
const collectionVar = (e: EntityIR): string => camel(e.tableName.replace(/_/g, ' '));

// ── Validator ──────────────────────────────────────────────────────
export const renderValidator = (e: EntityIR): string => {
  const wf = writableFields(e);
  const createRules = wf
    .map((f) => `  body('${f.attrName}')${f.required ? '' : `.optional({ nullable: true })`}${f.validator},`)
    .join('\n');
  const updateRules = wf
    .map((f) => `  body('${f.attrName}').optional({ nullable: true })${f.validator},`)
    .join('\n');

  const body = lines(
    banner(`Request validation for ${e.modelName}.`),
    `import { body } from 'express-validator';`,
    ``,
    `export const create${e.modelName}Rules = [`,
    createRules,
    `];`,
    ``,
    `export const update${e.modelName}Rules = [`,
    updateRules,
    `];`
  );
  return withTrailingNewline(body);
};

// ── Service ────────────────────────────────────────────────────────
export const renderService = (e: EntityIR, ir: IR, rulePlan: RulePlan): string => {
  const attrs = writableFields(e).map((f) => `'${f.attrName}'`);
  const isWf = e.isWorkflow && !!ir.workflow;
  const plan = entityRulePlan(rulePlan, e.key);

  const workflowImports = isWf
    ? lines(
        `import { TRANSITIONS, STATE_KEYS } from '../config/workflow';`,
        `import { notify } from './notification.service';`
      )
    : '';

  const notesBlock = plan.notes.length
    ? lines(`// ── Business rules (from the WorkflowSpec) ──`, ...plan.notes, '')
    : '';

  const transitionMethod = isWf ? renderTransitionMethod(e, ir, plan) : '';

  const body = lines(
    banner(`Data access & business logic for ${e.modelName}.`),
    `import { ${e.modelName} } from '../models/${e.modelName}.model';`,
    `import { AppError } from '../utils/AppError';`,
    workflowImports,
    ``,
    notesBlock,
    `const WRITABLE = [${attrs.join(', ')}] as const;`,
    ``,
    `const pick = (data: Record<string, any>): Record<string, any> => {`,
    `  const out: Record<string, any> = {};`,
    `  for (const key of WRITABLE) {`,
    `    if (data[key] !== undefined) out[key] = data[key];`,
    `  }`,
    `  return out;`,
    `};`,
    ``,
    `export interface ListOptions { page?: number; limit?: number; sort?: string; order?: string; }`,
    ``,
    `// Sortable columns are allow-listed: an unvalidated sort column would be`,
    `// interpolated straight into ORDER BY.`,
    `const SORTABLE: string[] = ['id', ${e.fields.map((f) => `'${f.attrName}'`).join(', ')}];`,
    ``,
    `export const list${e.modelName} = async (opts: ListOptions = {}) => {`,
    `  const page = Math.max(1, Number(opts.page) || 1);`,
    `  const limit = Math.min(100, Math.max(1, Number(opts.limit) || 25));`,
    `  const sort = SORTABLE.includes(String(opts.sort)) ? String(opts.sort) : 'id';`,
    `  const order = String(opts.order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';`,
    `  const { rows, count } = await ${e.modelName}.findAndCountAll({`,
    `    order: [[sort, order]] as any,`,
    `    limit,`,
    `    offset: (page - 1) * limit,`,
    `  });`,
    `  return {`,
    `    rows,`,
    `    pagination: { page, limit, total: count, totalPages: Math.max(1, Math.ceil(count / limit)) },`,
    `  };`,
    `};`,
    ``,
    `export const get${e.modelName} = async (id: number) => {`,
    `  const record = await ${e.modelName}.findByPk(id);`,
    `  if (!record) throw new AppError('${e.modelName} not found.', 404, 'NOT_FOUND');`,
    `  return record;`,
    `};`,
    ``,
    `export const create${e.modelName} = async (data: Record<string, any>) =>`,
    `  ${e.modelName}.create(pick(data));`,
    ``,
    `export const update${e.modelName} = async (id: number, data: Record<string, any>) => {`,
    `  const record = await get${e.modelName}(id);`,
    `  await record.update(pick(data));`,
    `  return record;`,
    `};`,
    ``,
    `export const delete${e.modelName} = async (id: number) => {`,
    `  const record = await get${e.modelName}(id);`,
    `  await record.destroy();`,
    `};`,
    transitionMethod
  );
  return withTrailingNewline(body);
};

const renderTransitionMethod = (
  e: EntityIR,
  ir: IR,
  plan: ReturnType<typeof entityRulePlan>
): string => {
  const wf = ir.workflow!;
  const guardBlocks = Object.entries(plan.transitionGuards)
    .map(([toState, guards]) =>
      lines(`  if (to === '${toState}') {`, indent(guards.join('\n\n'), 2), `  }`)
    )
    .join('\n');

  return lines(
    ``,
    `export const transition${e.modelName} = async (`,
    `  id: number,`,
    `  to: string,`,
    `  user: { id: number; role: string }`,
    `) => {`,
    `  if (!STATE_KEYS.includes(to)) {`,
    `    throw new AppError('Unknown target state.', 422, 'VALIDATION_ERROR');`,
    `  }`,
    `  const record = await ${e.modelName}.findByPk(id);`,
    `  if (!record) throw new AppError('${e.modelName} not found.', 404, 'NOT_FOUND');`,
    ``,
    `  const current = String((record as any).${wf.statusAttr});`,
    `  const t = TRANSITIONS.find((x) => x.from === current && x.to === to);`,
    `  if (!t) {`,
    `    const allowed = TRANSITIONS.filter((x) => x.from === current).map((x) => x.label).join(', ') || 'none';`,
    "    throw new AppError(`Cannot move from '${current}' to '${to}'. Allowed: ${allowed}.`, 409, 'INVALID_TRANSITION');",
    `  }`,
    `  // Transitions with a role are restricted to it; unroled transitions are`,
    `  // allowed for any authenticated user (no role was specified in the spec).`,
    `  if (t.roleKey && user.role !== t.roleKey) {`,
    "    throw new AppError(`Only the '${t.roleKey}' role can perform this action.`, 403, 'FORBIDDEN');",
    `  }`,
    guardBlocks,
    ``,
    `  (record as any).${wf.statusAttr} = to;`,
    `  await record.save();`,
    `  // Record an in-app notification (configured alerts live in config/notifications.ts).`,
    `  await notify({`,
    `    event: 'status_changed',`,
    `    entityType: '${e.varName}',`,
    `    entityId: (record as any).id,`,
    "    message: `" + e.modelName + " #${id} moved to '${to}'.`,",
    `  });`,
    `  return record;`,
    `};`
  );
};

// ── Controller ─────────────────────────────────────────────────────
export const renderController = (e: EntityIR, ir: IR): string => {
  const col = collectionVar(e);
  const isWf = e.isWorkflow && !!ir.workflow;

  const transitionHandler = isWf
    ? lines(
        ``,
        `export const transition = async (req: Request, res: Response, next: NextFunction) => {`,
        `  try {`,
        `    const user = (req as any).user as { id: number; role: string };`,
        `    const record = await svc.transition${e.modelName}(Number(req.params.id), String(req.body.to), user);`,
        `    res.json({ success: true, data: { ${e.varName}: record } });`,
        `  } catch (err) { next(err); }`,
        `};`
      )
    : '';

  const body = lines(
    banner(`HTTP handlers for ${e.modelName}.`),
    `import { Request, Response, NextFunction } from 'express';`,
    `import * as svc from '../services/${e.varName}.service';`,
    ``,
    `export const list = async (req: Request, res: Response, next: NextFunction) => {`,
    `  try {`,
    `    const { rows, pagination } = await svc.list${e.modelName}({`,
    `      page: Number(req.query.page),`,
    `      limit: Number(req.query.limit),`,
    `      sort: req.query.sort as string,`,
    `      order: req.query.order as string,`,
    `    });`,
    `    res.json({ success: true, data: { ${col}: rows, pagination } });`,
    `  } catch (err) { next(err); }`,
    `};`,
    ``,
    `export const get = async (req: Request, res: Response, next: NextFunction) => {`,
    `  try {`,
    `    const ${e.varName} = await svc.get${e.modelName}(Number(req.params.id));`,
    `    res.json({ success: true, data: { ${e.varName} } });`,
    `  } catch (err) { next(err); }`,
    `};`,
    ``,
    `export const create = async (req: Request, res: Response, next: NextFunction) => {`,
    `  try {`,
    `    const ${e.varName} = await svc.create${e.modelName}(req.body);`,
    `    res.status(201).json({ success: true, data: { ${e.varName} } });`,
    `  } catch (err) { next(err); }`,
    `};`,
    ``,
    `export const update = async (req: Request, res: Response, next: NextFunction) => {`,
    `  try {`,
    `    const ${e.varName} = await svc.update${e.modelName}(Number(req.params.id), req.body);`,
    `    res.json({ success: true, data: { ${e.varName} } });`,
    `  } catch (err) { next(err); }`,
    `};`,
    ``,
    `export const remove = async (req: Request, res: Response, next: NextFunction) => {`,
    `  try {`,
    `    await svc.delete${e.modelName}(Number(req.params.id));`,
    `    res.json({ success: true, data: { deleted: true } });`,
    `  } catch (err) { next(err); }`,
    `};`,
    transitionHandler
  );
  return withTrailingNewline(body);
};

// Verbs in a capability label that imply a WRITE (create/update/delete) action.
const WRITE_VERB =
  /\b(manage|edit|register|book|record|write|collect|schedule|approve|reject|add|create|update|delete|issue|process|assign|cancel|make|set|enter|submit|generate|withdraw|resolve)\b/i;

const tokensOf = (s: string): string[] =>
  s.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2);

/** Noun tokens (singular + plural) that identify an entity for capability matching. */
const entityNounTokens = (e: EntityIR): Set<string> => {
  const set = new Set<string>();
  const add = (w: string) => {
    set.add(w);
    set.add(w.replace(/s$/, ''));
    set.add(`${w}s`);
  };
  [e.key, e.varName, e.label, e.modelName].forEach((s) => tokensOf(s).forEach(add));
  return set;
};

/**
 * Derive which roles may WRITE an entity from the capability matrix: find the
 * write-verb capabilities whose noun matches this entity, then the roles the
 * matrix grants at least one of them. Returns null when the matrix implies no
 * restriction (no matching capability, would lock everyone out, or every role
 * is allowed) so we never emit a guard that misrepresents the spec.
 */
export const deriveEntityWriteRoles = (ir: IR, e: EntityIR): string[] | null => {
  const nouns = entityNounTokens(e);
  const matching = new Set<string>();
  for (const r of ir.roles) {
    for (const p of r.permissions) {
      if (!WRITE_VERB.test(p.action)) continue;
      const words = tokensOf(p.action);
      if (words.some((w) => nouns.has(w) || nouns.has(w.replace(/s$/, '')))) matching.add(p.action);
    }
  }
  if (matching.size === 0) return null;
  const allowed = ir.roles
    .filter((r) => r.permissions.some((p) => matching.has(p.action) && p.allowed))
    .map((r) => r.key);
  if (allowed.length === 0 || allowed.length === ir.roles.length) return null;
  return allowed;
};

// ── Routes ─────────────────────────────────────────────────────────
export const renderRoutes = (e: EntityIR, ir: IR, rulePlan: RulePlan): string => {
  const isWf = e.isWorkflow && !!ir.workflow;

  // Which roles may create/update/delete this entity: an explicit access rule
  // (P3) wins; otherwise the permission matrix. Reads stay open to any auth user.
  const p3Roles = entityRulePlan(rulePlan, e.key).roleGuards;
  const writeRoles = p3Roles.length ? p3Roles : deriveEntityWriteRoles(ir, e);
  const hasGuard = !!writeRoles && writeRoles.length > 0;
  const writeGuard = hasGuard ? `requireRole(${writeRoles!.map((r) => `'${r}'`).join(', ')}), ` : '';
  const rbacImport = hasGuard ? `import { requireRole } from '../middleware/rbac.middleware';` : '';
  const guardComment = hasGuard
    ? `// Write access (create/update/delete) restricted to: ${writeRoles!.join(', ')}.`
    : '';

  // Permission-matrix header comment (full matrix reference; see config/roles.ts).
  const permComment = lines(
    `// Permission matrix (from the WorkflowSpec — see config/roles.ts):`,
    ...ir.roles.map((r) => {
      const allowed = r.permissions.filter((p) => p.allowed).map((p) => p.action);
      return `//   ${r.key}: ${allowed.length ? allowed.join(', ') : '(no explicit permissions)'}`;
    })
  );

  const transitionRoute = isWf
    ? `router.post('/:id/transition', ctrl.transition);`
    : '';

  const body = lines(
    banner(`Routes for ${e.modelName} (mounted at /api/${e.routeBase}).`),
    `import { Router } from 'express';`,
    `import { protect } from '../middleware/auth.middleware';`,
    rbacImport,
    `import { validate } from '../middleware/validate.middleware';`,
    `import * as ctrl from '../controllers/${e.varName}.controller';`,
    `import { create${e.modelName}Rules, update${e.modelName}Rules } from '../validators/${e.varName}.validator';`,
    ``,
    `const router = Router();`,
    `router.use(protect);`,
    ``,
    permComment,
    guardComment,
    ``,
    `router.get('/', ctrl.list);`,
    `router.get('/:id', ctrl.get);`,
    `router.post('/', ${writeGuard}create${e.modelName}Rules, validate, ctrl.create);`,
    `router.put('/:id', ${writeGuard}update${e.modelName}Rules, validate, ctrl.update);`,
    `router.delete('/:id', ${writeGuard}ctrl.remove);`,
    transitionRoute,
    ``,
    `export default router;`
  );
  return withTrailingNewline(body);
};

// ── Route index ────────────────────────────────────────────────────
export const renderRouteIndex = (ir: IR): string => {
  const imports = lines(
    banner('API route registry.'),
    `import { Router } from 'express';`,
    `import authRoutes from './auth.routes';`,
    `import notificationRoutes from './notification.routes';`,
    ...ir.entities.map((e) => `import ${e.varName}Routes from './${e.varName}.routes';`)
  );
  const mounts = lines(
    `router.use('/auth', authRoutes);`,
    `router.use('/notifications', notificationRoutes);`,
    ...ir.entities.map((e) => `router.use('/${e.routeBase}', ${e.varName}Routes);`)
  );
  const body = lines(
    imports,
    ``,
    `const router = Router();`,
    ``,
    mounts,
    ``,
    `export default router;`
  );
  return withTrailingNewline(body);
};
