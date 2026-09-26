import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { generateArtifacts } from '../generate';
import { SpecInput } from '../ir/buildIR';
import { getDomainTemplate } from '../../config/domainTemplates';
import { FileArtifact } from '../types';

// A non-default theme so the emitted theme.css / branding is exercised.
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

const errorsOf = (rootNames: string[], options: ts.CompilerOptions, tmpRoot: string): string[] => {
  if (rootNames.length === 0) return [];
  const program = ts.createProgram(rootNames, options);
  return ts
    .getPreEmitDiagnostics(program)
    .filter((d) => d.category === ts.DiagnosticCategory.Error)
    .map((d) => {
      const where = d.file ? `${path.relative(tmpRoot, d.file.fileName)}: ` : '';
      return where + ts.flattenDiagnosticMessageText(d.messageText, '\n');
    });
};

/**
 * Type-check the emitted app with the real TypeScript compiler. The backend
 * (`src/**`) and the emitted frontend (`client/**`, JSX) are checked with two
 * programs so each gets the right module/JSX settings. Files are written under
 * the server tree so Node module resolution reaches the platform server's
 * node_modules (sequelize, express, react, react-dom, react-router-dom, @types/*).
 */
const typeCheck = (domain: 'clinic' | 'school') => {
  const { artifacts } = generateArtifacts(specFor(domain), `${domain} demo`);

  const tmpParent = path.join(__dirname, '..', '..', '..', '.gen-compile-tmp');
  const tmpRoot = path.join(tmpParent, domain);
  fs.rmSync(tmpRoot, { recursive: true, force: true });

  const isBackend = (a: FileArtifact) => a.path.startsWith('src/') && a.path.endsWith('.ts');
  // Only the app source under client/src (config files like vite.config.ts import
  // vite types that aren't installed for the test — they're standard boilerplate).
  const isClient = (a: FileArtifact) =>
    a.path.startsWith('client/src/') && (a.path.endsWith('.ts') || a.path.endsWith('.tsx'));

  const backend = artifacts.filter(isBackend);
  const client = artifacts.filter(isClient);

  for (const a of [...backend, ...client]) {
    const full = path.join(tmpRoot, a.path);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, a.contents, 'utf8');
  }

  const backendErrors = errorsOf(
    backend.map((a) => path.join(tmpRoot, a.path)),
    {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      esModuleInterop: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      resolveJsonModule: true,
      forceConsistentCasingInFileNames: true,
      baseUrl: tmpRoot,
    },
    tmpRoot
  );

  const clientErrors = errorsOf(
    client.map((a) => path.join(tmpRoot, a.path)),
    {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      lib: ['lib.es2020.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
      baseUrl: path.join(tmpRoot, 'client'),
    },
    tmpRoot
  );

  fs.rmSync(tmpRoot, { recursive: true, force: true });
  fs.rmSync(tmpParent, { recursive: true, force: true });
  return [...backendErrors, ...clientErrors];
};

describe.each(['clinic', 'school'] as const)('emitted %s app compiles', (domain) => {
  it('type-checks (backend + frontend) with zero errors', () => {
    const errors = typeCheck(domain);
    expect(errors).toEqual([]);
  });
});
