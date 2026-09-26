/**
 * RUNTIME verification of the generated application.
 *
 * The golden test proves the emitted TEXT is stable and the compile test proves
 * it TYPE-CHECKS. Neither proves it RUNS. This suite generates the clinic app
 * through the real pipeline, compiles it to JS, runs its actual migrations
 * against an in-memory Postgres (pg-mem), mounts the emitted Express app and
 * drives real HTTP requests through it.
 *
 * `pg` is intercepted at the module level so the emitted app connects to pg-mem
 * without containing any test-only seam — the generated code is byte-identical
 * to what a user downloads in their ZIP.
 */
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { generateArtifacts } from '../generate';
import { SpecInput } from '../ir/buildIR';
import { getDomainTemplate } from '../../config/domainTemplates';

/**
 * Single in-memory Postgres shared by the emitted app and the assertions.
 *
 * pg-mem is an emulator with known gaps. It rejects `DECIMAL(p,s)` because its
 * query planner does not read the precision config — the emitted SQL is valid
 * PostgreSQL, so the right fix is to compensate HERE rather than to change what
 * the generator emits (money must stay DECIMAL(12,2), not float). The rewrite is
 * confined to this test adapter and is logged so it can never be mistaken for
 * generator behaviour.
 */
const PGMEM_LIMITATIONS: Array<{ why: string; from: RegExp; to: string }> = [
  {
    why: 'pg-mem ignores DECIMAL precision/scale — real Postgres accepts DECIMAL(12,2)',
    from: /\bDECIMAL\s*\(\s*\d+\s*,\s*\d+\s*\)/gi,
    to: 'DECIMAL',
  },
  {
    // In PostgreSQL a CHECK is satisfied when it evaluates to true OR NULL, so
    // `CHECK (col IN (...))` accepts a NULL col. pg-mem treats NULL as a
    // violation. Making the NULL case explicit is a no-op in real Postgres.
    why: 'pg-mem treats NULL as violating CHECK (col IN (...)); Postgres does not',
    from: /CHECK \((\"?\w+\"?) IN \(/gi,
    to: 'CHECK ($1 IS NULL OR $1 IN (',
  },
];

const compensate = (sql: string): string =>
  PGMEM_LIMITATIONS.reduce((acc, r) => acc.replace(r.from, r.to), sql);

jest.mock('pg', () => {
  const { newDb } = require('pg-mem');
  const g = global as any;
  // NOT autoCreateForeignKeyIndices: real PostgreSQL does not index foreign keys
  // automatically — that is exactly why the generator emits the indexes itself.
  // Leaving pg-mem's convenience on would both mask a missing index and collide
  // with the emitted CREATE INDEX.
  g.__PGMEM__ = g.__PGMEM__ || newDb({ autoCreateForeignKeyIndices: false });
  const pg = g.__PGMEM__.adapters.createPg();

  const patch = (Ctor: any) => {
    const original = Ctor.prototype.query;
    Ctor.prototype.query = function patched(this: any, config: any, ...rest: any[]) {
      const rewrite = (s: string) => (g.__COMPENSATE__ ? g.__COMPENSATE__(s) : s);
      if (typeof config === 'string') return original.call(this, rewrite(config), ...rest);
      if (config && typeof config.text === 'string') {
        return original.call(this, { ...config, text: rewrite(config.text) }, ...rest);
      }
      return original.call(this, config, ...rest);
    };
  };
  patch(pg.Client);
  return pg;
});

const specFor = (domain: 'clinic' | 'school'): SpecInput => {
  const t = getDomainTemplate(domain);
  return {
    domain,
    entities: t.entities,
    roles: t.roles,
    states: t.states,
    transitions: t.transitions,
    businessRules: t.businessRules,
    notificationTriggers: t.notificationTriggers,
  };
};

/** Generate the app and compile its backend to runnable JS underneath server/. */
const emitRuntimeApp = (domain: 'clinic' | 'school'): string => {
  const { artifacts } = generateArtifacts(specFor(domain), `${domain} runtime`);
  const tmpRoot = path.join(__dirname, '..', '..', '..', '.gen-runtime-tmp', domain);
  fs.rmSync(tmpRoot, { recursive: true, force: true });

  const backend = artifacts.filter((a) => a.path.startsWith('src/') && a.path.endsWith('.ts'));
  const migrations = artifacts.filter((a) => a.path.startsWith('migrations/'));

  for (const a of [...backend, ...migrations]) {
    const full = path.join(tmpRoot, a.path);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, a.contents, 'utf8');
  }

  const program = ts.createProgram(
    backend.map((a) => path.join(tmpRoot, a.path)),
    {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      esModuleInterop: true,
      skipLibCheck: true,
      strict: false,
      noEmit: false,
      outDir: path.join(tmpRoot, 'built'),
      rootDir: tmpRoot,
      resolveJsonModule: true,
      baseUrl: tmpRoot,
    }
  );
  const result = program.emit();
  if (result.emitSkipped) throw new Error('TypeScript emit failed for the generated app');
  return tmpRoot;
};

const built = (tmpRoot: string, ...parts: string[]) =>
  path.join(tmpRoot, 'built', 'src', ...parts);

/** Mint a JWT the emitted auth middleware will accept (it reads JWT_SECRET). */
const signToken = (role: string): string => {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id: 1, email: 'test@example.com', role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

describe('generated clinic app — runtime behaviour', () => {
  jest.setTimeout(180_000);

  let tmpRoot: string;
  let app: any;
  let db: any;
  let request: any;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'flowforge-runtime-test-secret';
    process.env.NODE_ENV = 'test';
    (global as any).__COMPENSATE__ = compensate;

    tmpRoot = emitRuntimeApp('clinic');
    request = require('supertest');

    // Run the REAL emitted migrations, in filename order.
    // NOTE: requiring the emitted database config is what first pulls in `pg`,
    // which is when the mock factory creates the pg-mem instance — so the handle
    // must be read AFTER this line, not before.
    const { sequelize } = require(built(tmpRoot, 'config', 'database.js'));
    db = (global as any).__PGMEM__;
    const Sequelize = require('sequelize');
    const qi = sequelize.getQueryInterface();
    const dir = path.join(tmpRoot, 'migrations');
    for (const file of fs.readdirSync(dir).sort()) {
      const migration = require(path.join(dir, file));
      try {
        await migration.up(qi, Sequelize);
      } catch (err: any) {
        throw new Error(
          `Migration ${file} failed: ${err?.message || err}\n` +
          `SQL: ${err?.sql || err?.parent?.sql || '(none)'}\n` +
          `Cause: ${err?.parent?.message || err?.original?.message || '(none)'}`
        );
      }
    }

    // The emitted module exports a FACTORY (`createApp`), not a ready app —
    // passing the factory straight to supertest hangs instead of erroring.
    const { createApp } = require(built(tmpRoot, 'app.js'));
    app = createApp();
  });

  afterAll(() => {
    fs.rmSync(path.join(tmpRoot, '..'), { recursive: true, force: true });
  });

  // ── R1 — the emitted migrations actually run ──
  it('R1: creates every expected table from the emitted migrations', () => {
    const rows = db.public.many(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    );
    const names = rows.map((r: any) => r.table_name);
    expect(names).toEqual(
      expect.arrayContaining(['users', 'patients', 'appointments', 'consultations', 'payments', 'notifications'])
    );
  });

  // ── R2 — a full CRUD round-trip over real HTTP ──
  it('R2: creates, reads, updates and deletes a record over HTTP', async () => {
    const token = signToken('receptionist');

    const created = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Ada Lovelace', phoneNumber: '+441234567890', age: 36 });
    expect(created.status).toBe(201);
    const id = created.body?.data?.patient?.id;
    expect(id).toBeDefined();

    const fetched = await request(app)
      .get(`/api/patients/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.data.patient.fullName).toBe('Ada Lovelace');

    const updated = await request(app)
      .put(`/api/patients/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ age: 37 });
    expect(updated.status).toBe(200);
    expect(Number(updated.body.data.patient.age)).toBe(37);

    const removed = await request(app)
      .delete(`/api/patients/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect([200, 204]).toContain(removed.status);

    const gone = await request(app)
      .get(`/api/patients/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(gone.status).toBe(404);
  });

  // ── R3 — the emitted express-validator chains actually reject bad input ──
  it('R3: rejects a create that omits required fields', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${signToken('receptionist')}`)
      .send({ age: 30 }); // no fullName / phoneNumber
    // The emitted validate middleware answers 422 VALIDATION_ERROR (not 400).
    expect(res.status).toBe(422);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  // ── R4 — enum values are constrained ──
  it('R4: rejects a value outside an enum column\'s allowed set', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${signToken('receptionist')}`)
      .send({ fullName: 'Bad Enum', phoneNumber: '+441234567890', gender: 'Teleported' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  // ── R5 — pagination (FE6.3) ──
  it('R5: paginates list results', async () => {
    const token = signToken('receptionist');
    for (let i = 0; i < 7; i++) {
      await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${token}`)
        .send({ fullName: `Patient ${i}`, phoneNumber: '+441234567890', age: 20 + i });
    }
    const res = await request(app)
      .get('/api/patients?page=2&limit=3')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.patients).toHaveLength(3);
    expect(res.body.data.pagination).toMatchObject({ page: 2, limit: 3 });
    expect(res.body.data.pagination.total).toBeGreaterThanOrEqual(7);
  });

  // ── R6/R7/R8 — the workflow engine, RBAC and rule guards ──
  const newAppointment = async (dateISO: string): Promise<number> => {
    const token = signToken('receptionist');
    const patient = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'WF Subject', phoneNumber: '+441234567890' });
    const created = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({ patientId: patient.body.data.patient.id, date: dateISO, time: '09:00' });
    expect(created.status).toBe(201);
    return created.body.data.appointment.id;
  };

  it('R6: a workflow transition updates the status and records a notification', async () => {
    const { TRANSITIONS, STATES } = require(built(tmpRoot, 'config', 'workflow.js'));
    const initial = STATES.find((s: any) => s.isInitial).key;
    const t = TRANSITIONS.find((x: any) => x.from === initial && x.to !== 'cancelled');
    expect(t).toBeDefined();

    const id = await newAppointment('2099-01-01');
    const before = (db.public.many(`SELECT COUNT(*)::int AS c FROM notifications`)[0] as any).c;

    const res = await request(app)
      .post(`/api/appointments/${id}/transition`)
      .set('Authorization', `Bearer ${signToken(t.roleKey || 'receptionist')}`)
      .send({ to: t.to });
    expect(res.status).toBe(200);

    const row = db.public.many(`SELECT status FROM appointments WHERE id = ${id}`)[0] as any;
    expect(row.status).toBe(t.to);

    const after = (db.public.many(`SELECT COUNT(*)::int AS c FROM notifications`)[0] as any).c;
    expect(after).toBeGreaterThan(before);
  });

  it('R7: refuses a role-restricted transition to the wrong role', async () => {
    const { TRANSITIONS, STATES } = require(built(tmpRoot, 'config', 'workflow.js'));
    const initial = STATES.find((s: any) => s.isInitial).key;
    const t = TRANSITIONS.find((x: any) => x.from === initial && x.roleKey);
    if (!t) {
      throw new Error('No role-restricted transition from the initial state — R7 cannot be evaluated.');
    }
    const wrongRole = ['receptionist', 'doctor', 'manager'].find((r) => r !== t.roleKey)!;

    const id = await newAppointment('2099-01-01');
    const res = await request(app)
      .post(`/api/appointments/${id}/transition`)
      .set('Authorization', `Bearer ${signToken(wrongRole)}`)
      .send({ to: t.to });
    expect(res.status).toBe(403);
  });

  it('R8: enforces the 24-hour cancellation rule emitted from the business rules', async () => {
    const { TRANSITIONS, STATES } = require(built(tmpRoot, 'config', 'workflow.js'));
    const initial = STATES.find((s: any) => s.isInitial).key;
    const cancel = TRANSITIONS.find((x: any) => x.from === initial && x.to === 'cancelled');
    expect(cancel).toBeDefined();

    // Dated today — inside the 24h window the business rule protects.
    const today = new Date().toISOString().slice(0, 10);
    const id = await newAppointment(today);

    const res = await request(app)
      .post(`/api/appointments/${id}/transition`)
      .set('Authorization', `Bearer ${signToken(cancel.roleKey || 'receptionist')}`)
      .send({ to: 'cancelled' });

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).toMatch(/RULE_VIOLATION|in advance/i);
  });
});
