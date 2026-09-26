import { IR } from '../types';
import { banner, lines, withTrailingNewline } from './helpers';

/** Render `src/config/workflow.ts` — the state machine as data. */
export const renderWorkflowConfig = (ir: IR): string => {
  const wf = ir.workflow;
  if (!wf) {
    return withTrailingNewline(
      lines(
        banner('Workflow config (no workflow entity in this spec).'),
        `export interface WorkflowState { key: string; label: string; isInitial: boolean; isFinal: boolean; }`,
        `export interface WorkflowTransition { from: string; to: string; label: string; roleKey?: string; }`,
        `export const STATES: WorkflowState[] = [];`,
        `export const STATE_KEYS: string[] = [];`,
        `export const INITIAL_STATE = '';`,
        `export const TRANSITIONS: WorkflowTransition[] = [];`
      )
    );
  }

  const states = JSON.stringify(wf.states, null, 2);
  const transitions = JSON.stringify(
    wf.transitions.map((t) => (t.roleKey ? t : { from: t.from, to: t.to, label: t.label })),
    null,
    2
  );

  const body = lines(
    banner(`Workflow state machine for ${wf.entityModel}.`),
    `export interface WorkflowState { key: string; label: string; isInitial: boolean; isFinal: boolean; }`,
    `export interface WorkflowTransition { from: string; to: string; label: string; roleKey?: string; }`,
    ``,
    `export const STATES: WorkflowState[] = ${states};`,
    ``,
    `export const STATE_KEYS: string[] = STATES.map((s) => s.key);`,
    ``,
    `export const INITIAL_STATE = '${wf.initialStateKey}';`,
    ``,
    `export const TRANSITIONS: WorkflowTransition[] = ${transitions};`
  );
  return withTrailingNewline(body);
};

/** Render `src/config/roles.ts` — role keys + permission matrix as data. */
export const renderRolesConfig = (ir: IR): string => {
  const roleKeys = ir.roleKeys.map((k) => `'${k}'`).join(', ');
  const matrix = JSON.stringify(ir.permissionMatrix, null, 2);

  const body = lines(
    banner('Roles & permission matrix (from the WorkflowSpec).'),
    `export const ROLE_KEYS = [${roleKeys}] as const;`,
    `export type RoleKey = typeof ROLE_KEYS[number];`,
    ``,
    `// action -> allowed, per role. Entity CRUD routes are guarded from this matrix`,
    `// (see the route files); use can() for finer-grained capability checks.`,
    `export const PERMISSION_MATRIX: Record<string, Record<string, boolean>> = ${matrix};`,
    ``,
    `/** True if the given role is granted the named capability. */`,
    `export const can = (role: string, action: string): boolean =>`,
    `  PERMISSION_MATRIX[role]?.[action] === true;`
  );
  return withTrailingNewline(body);
};
