import { StageContext } from './stage';
import { FileArtifact, StageResult, StageLog } from '../types';
import { renderRolesConfig } from '../templates/config';
import { renderRbacMiddleware } from '../templates/scaffold';

/**
 * Stage 5 — RBAC backbone. The role config + role-guard middleware are emitted
 * here; the concrete rule guards were woven into the services (transition
 * guards) and rule TODO comments during Stages 3–4. Reports the tally.
 */
export const generateRulesStage = ({ ir, rulePlan }: StageContext): StageResult => {
  const artifacts: FileArtifact[] = [
    { path: 'src/config/roles.ts', contents: renderRolesConfig(ir) },
    { path: 'src/middleware/rbac.middleware.ts', contents: renderRbacMiddleware() },
  ];

  const logs: StageLog[] = [
    { level: 'info', message: `Interpreting ${ir.rules.length} business rule(s)...` },
    {
      level: rulePlan.guardCount > 0 ? 'success' : 'info',
      message: `${rulePlan.guardCount} rule(s) enforced with real transition guards.`,
    },
    {
      level: rulePlan.flaggedCount > 0 ? 'warning' : 'info',
      message: `${rulePlan.flaggedCount} rule(s) surfaced as role notes / TODOs for manual review.`,
    },
    { level: 'success', message: 'Emitted role config + role-guard middleware.' },
  ];

  return { artifacts, logs };
};
