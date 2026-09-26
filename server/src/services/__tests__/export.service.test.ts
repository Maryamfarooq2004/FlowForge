import { generateArtifacts } from '../../generation/generate';
import { SpecInput } from '../../generation/ir/buildIR';
import { getDomainTemplate } from '../../config/domainTemplates';
import { slugify, zipEntries } from '../export.service';
import { IGenerationRun } from '../../models/GenerationRun.model';

const specFor = (domain: 'clinic' | 'school'): SpecInput => {
  const t = getDomainTemplate(domain);
  return { domain, entities: t.entities, roles: t.roles, states: t.states, transitions: t.transitions, businessRules: t.businessRules };
};

// A minimal fake run carrying a real generated manifest.
const fakeRun = (domain: 'clinic' | 'school') => {
  const { artifacts } = generateArtifacts(specFor(domain), `${domain} demo`);
  return { artifacts: artifacts.map((a) => ({ path: a.path, lang: 'ts', size: a.contents.length, contents: a.contents })) } as unknown as IGenerationRun;
};

describe('slugify', () => {
  it('produces a filesystem-safe slug', () => {
    expect(slugify('Al Shifa Clinic')).toBe('al-shifa-clinic');
    expect(slugify('  My/Org **2**  ')).toBe('my-org-2');
    expect(slugify('')).toBe('app');
    expect(slugify('!!!')).toBe('app');
  });
});

describe.each(['clinic', 'school'] as const)('zipEntries — %s', (domain) => {
  const run = fakeRun(domain);
  const entries = zipEntries(run, 'my-app');

  it('root-prefixes every artifact with the app slug', () => {
    expect(entries.length).toBe((run.artifacts as any[]).length);
    expect(entries.every((e) => e.name.startsWith('my-app/'))).toBe(true);
  });

  it('includes the key project files (backend + frontend + deploy bundle)', () => {
    const names = entries.map((e) => e.name);
    for (const f of [
      'package.json', 'tsconfig.json', 'schema.sql', 'src/server.ts', 'Dockerfile', 'LICENSE', 'README.md',
      'client/package.json', 'client/src/main.tsx', 'client/src/App.tsx',
    ]) {
      expect(names).toContain(`my-app/${f}`);
    }
    // at least one migration + one model + one generated React page
    expect(names.some((n) => /my-app\/migrations\/\d+-create-.+\.js/.test(n))).toBe(true);
    expect(names.some((n) => /my-app\/src\/models\/.+\.model\.ts/.test(n))).toBe(true);
    expect(names.some((n) => /my-app\/client\/src\/pages\/.+ListPage\.tsx/.test(n))).toBe(true);
  });

  it('preserves file contents verbatim', () => {
    const pkg = entries.find((e) => e.name === 'my-app/package.json')!;
    expect(pkg.contents).toContain('"sequelize"');
  });
});
// (Real ZIP streaming via archiver is exercised by the export E2E against the
// running server; ts-jest can't load archiver's transitive ESM deps in-process.)
