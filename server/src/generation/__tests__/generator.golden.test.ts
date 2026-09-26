import { generateArtifacts } from '../generate';
import { SpecInput } from '../ir/buildIR';
import { getDomainTemplate } from '../../config/domainTemplates';
import { FileArtifact } from '../types';

const TEST_THEME = {
  colors: { primary: '#1D4ED8', secondary: '#1E3A8A', accent: '#38BDF8' },
  fonts: { heading: 'Poppins', body: 'Inter' },
};

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
    theme: TEST_THEME,
  };
};

const get = (artifacts: FileArtifact[], path: string) => artifacts.find((a) => a.path === path);

describe.each(['clinic', 'school'] as const)('generated backend — %s', (domain) => {
  const { artifacts } = generateArtifacts(specFor(domain), `${domain} demo`);
  const paths = artifacts.map((a) => a.path);

  it('emits the core scaffold files', () => {
    for (const p of [
      'schema.sql',
      'package.json',
      'tsconfig.json',
      'README.md',
      'src/server.ts',
      'src/app.ts',
      'src/config/database.ts',
      'src/config/roles.ts',
      'src/config/workflow.ts',
      'src/models/index.ts',
      'src/models/User.model.ts',
      'src/middleware/auth.middleware.ts',
      'src/middleware/rbac.middleware.ts',
      'src/routes/index.ts',
    ]) {
      expect(paths).toContain(p);
    }
  });

  it('emits the deploy bundle (Phase 5)', () => {
    for (const p of ['Dockerfile', '.dockerignore', 'LICENSE', 'railway.json', 'render.yaml', 'DEPLOY.md']) {
      expect(paths).toContain(p);
    }
    // docker-compose now includes an app service alongside the db.
    const compose = get(artifacts, 'docker-compose.yml')!.contents;
    expect(compose).toMatch(/\n {2}app:/);
    expect(compose).toContain('build: .');
  });

  it('emits a full file set per entity', () => {
    const template = getDomainTemplate(domain);
    for (const e of template.entities) {
      // Each entity gets a model, service, controller, routes, validator + a migration.
      const modelFiles = paths.filter((p) => p.startsWith('src/models/') && p.endsWith('.model.ts'));
      expect(modelFiles.length).toBe(template.entities.length + 2); // +User +Notification
    }
    const migrations = paths.filter((p) => p.startsWith('migrations/'));
    expect(migrations.length).toBe(template.entities.length + 2); // +users +notifications
    const services = paths.filter(
      (p) =>
        p.startsWith('src/services/') &&
        p !== 'src/services/auth.service.ts' &&
        p !== 'src/services/notification.service.ts'
    );
    expect(services.length).toBe(template.entities.length);
  });

  it('creates migrations in dependency order (referenced tables first)', () => {
    const migrations = artifacts.filter((a) => a.path.startsWith('migrations/'));
    const order = new Map<string, number>();
    for (const m of migrations) {
      const match = m.path.match(/migrations\/(\d+)-create-(.+)\.js$/);
      expect(match).toBeTruthy();
      order.set(match![2], parseInt(match![1], 10));
    }
    // Filenames sorted == numeric order.
    const nums = migrations.map((m) => parseInt(m.path.match(/(\d+)-/)![1], 10));
    expect(nums).toEqual([...nums].sort((a, b) => a - b));

    // Every referenced table has a lower migration number than the referrer.
    for (const m of migrations) {
      const self = parseInt(m.path.match(/(\d+)-/)![1], 10);
      const refs = [...m.contents.matchAll(/model: '([^']+)'/g)].map((x) => x[1]);
      for (const ref of refs) {
        expect(order.get(ref)).toBeDefined();
        expect(order.get(ref)!).toBeLessThan(self);
      }
    }
  });

  it('drives the workflow status column from the state machine', () => {
    const wfConfig = get(artifacts, 'src/config/workflow.ts')!.contents;
    const template = getDomainTemplate(domain);
    const stateKeys = [...template.states].sort((a, b) => a.order - b.order).map((s) => s.key);
    const initial = (template.states.find((s) => s.isInitial) ?? template.states[0]).key;

    expect(wfConfig).toContain(`export const INITIAL_STATE = '${initial}';`);

    // The workflow entity's model uses the state keys + initial default.
    const wfEntity = template.entities.find((e) => e.isWorkflowEntity)!;
    const modelName = wfEntity.name.replace(/\s+/g, '');
    const model = get(artifacts, `src/models/${modelName}.model.ts`)!.contents;
    expect(model).toContain(`defaultValue: '${initial}'`);
    for (const key of stateKeys) expect(model).toContain(`'${key}'`);
  });

  it('emits CHECK constraints for every enum column in schema.sql', () => {
    const schema = get(artifacts, 'schema.sql')!.contents;
    // Enum options from the templates should appear inside a CHECK (...).
    expect(schema).toMatch(/CHECK \("status" IN \(/);
    expect(schema).toMatch(/CHECK \("role" IN \(/); // users table
  });

  it('emits the in-app notifications subsystem (Phase 6)', () => {
    expect(paths).toContain('src/models/Notification.model.ts');
    expect(paths).toContain('src/services/notification.service.ts');
    expect(paths).toContain('src/routes/notification.routes.ts');
    expect(paths).toContain('src/config/notifications.ts');
    expect(paths.some((p) => /migrations\/\d+-create-notifications\.js/.test(p))).toBe(true);

    // Route registry mounts the notifications API.
    expect(get(artifacts, 'src/routes/index.ts')!.contents).toContain(`router.use('/notifications', notificationRoutes);`);

    // The schema + notifications table.
    expect(get(artifacts, 'schema.sql')!.contents).toContain('CREATE TABLE "notifications"');

    // Configured alert triggers flow into the generated app.
    const notifCfg = get(artifacts, 'src/config/notifications.ts')!.contents;
    expect(notifCfg).toContain('export const NOTIFICATION_TRIGGERS');
    const template = getDomainTemplate(domain);
    expect(notifCfg).toContain(template.notificationTriggers[0].event);
  });

  it('records a notification on every workflow transition (Phase 6)', () => {
    const services = artifacts.filter((a) => a.path.startsWith('src/services/') && a.path.endsWith('.service.ts'));
    const withNotify = services.filter((s) => s.contents.includes('await notify('));
    expect(withNotify.length).toBeGreaterThan(0);
    // The workflow service also imports the notify helper.
    expect(withNotify[0].contents).toContain(`import { notify } from './notification.service';`);
  });

  it('enforces RBAC on write routes from the permission matrix (Phase 6)', () => {
    // The `payment` entity has a role-restricted write set in both domains.
    const payRoutes = get(artifacts, 'src/routes/payment.routes.ts');
    expect(payRoutes).toBeTruthy();
    expect(payRoutes!.contents).toContain(`import { requireRole } from '../middleware/rbac.middleware';`);
    expect(payRoutes!.contents).toMatch(/router\.post\('\/', requireRole\(/);

    // The role config exposes an enforced capability helper.
    expect(get(artifacts, 'src/config/roles.ts')!.contents).toContain('export const can =');
  });

  it('emits the React frontend (Stage 6)', () => {
    const template = getDomainTemplate(domain);
    // Scaffold + core app files.
    for (const p of [
      'client/package.json',
      'client/tsconfig.json',
      'client/vite.config.ts',
      'client/index.html',
      'client/Dockerfile',
      'client/src/main.tsx',
      'client/src/App.tsx',
      'client/src/theme.css',
      'client/src/api/client.ts',
      'client/src/auth/LoginPage.tsx',
      'client/src/lib/meta.ts',
      'client/src/components/Layout.tsx',
      'client/src/pages/DashboardPage.tsx',
    ]) {
      expect(paths).toContain(p);
    }
    // Per-entity List/Form/Detail pages.
    for (const e of template.entities) {
      const model = e.name.replace(/\s+/g, '');
      const varName = model.charAt(0).toLowerCase() + model.slice(1);
      expect(paths.some((p) => p === `client/src/pages/${varName}/${model}ListPage.tsx`)).toBe(true);
      expect(paths.some((p) => p === `client/src/pages/${varName}/${model}FormPage.tsx`)).toBe(true);
      expect(paths.some((p) => p === `client/src/pages/${varName}/${model}DetailPage.tsx`)).toBe(true);
    }
    // The theme flows into the emitted CSS + the router wires entity routes.
    expect(get(artifacts, 'client/src/theme.css')!.contents).toContain('--color-primary: #1D4ED8;');
    expect(get(artifacts, 'client/src/App.tsx')!.contents).toContain('element={<DashboardPage />}');
  });

  it('is deterministic (byte-identical across runs)', () => {
    const a = generateArtifacts(specFor(domain), `${domain} demo`);
    const b = generateArtifacts(specFor(domain), `${domain} demo`);
    expect(JSON.stringify(a.artifacts)).toBe(JSON.stringify(b.artifacts));
  });

  it('matches the golden snapshot', () => {
    expect(artifacts).toMatchSnapshot();
  });
});

/**
 * FE6.1 — UNIQUE is user-DECLARED, never inferred. No seed field sets it (so the
 * golden snapshots are unaffected); these tests drive it explicitly.
 */
describe('user-declared UNIQUE reaches the generated database', () => {
  const specWithUnique = (): SpecInput => {
    const spec = specFor('clinic');
    const patient = spec.entities.find((e) => e.key === 'patient')!;
    return {
      ...spec,
      entities: spec.entities.map((e) =>
        e.key !== patient.key
          ? e
          : {
              ...e,
              fields: e.fields.map((f) =>
                f.name === 'Phone Number' ? { ...f, unique: true } : f
              ),
            }
      ),
    };
  };

  const { artifacts } = generateArtifacts(specWithUnique(), 'unique demo');

  it('emits UNIQUE on the column in schema.sql', () => {
    expect(get(artifacts, 'schema.sql')!.contents).toMatch(
      /"phone_number" VARCHAR\(32\) NOT NULL UNIQUE/
    );
  });

  it('emits a unique index in schema.sql and the migration', () => {
    expect(get(artifacts, 'schema.sql')!.contents).toContain(
      'CREATE UNIQUE INDEX "patients_phone_number_uniq" ON "patients" ("phone_number");'
    );
    const migration = artifacts.find((a) => a.path.includes('create-patients'))!;
    expect(migration.contents).toContain(
      `addIndex('patients', ['phone_number'], { name: 'patients_phone_number_uniq', unique: true })`
    );
  });

  it('emits unique: true on the Sequelize model', () => {
    expect(get(artifacts, 'src/models/Patient.model.ts')!.contents).toMatch(
      /phoneNumber:.*unique: true/
    );
  });

  it('never marks a foreign key unique (that would force one-to-one)', () => {
    const schema = get(artifacts, 'schema.sql')!.contents;
    expect(schema).not.toMatch(/"patient_id" INTEGER NOT NULL UNIQUE/);
  });
});
