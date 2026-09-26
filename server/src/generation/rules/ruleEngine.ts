import { IR, EntityIR } from '../types';

/**
 * Deterministic business-rule interpreter. Free-text rules are classified with
 * a small ordered pattern set into either REAL transition guards (only when the
 * referenced field is resolvable from the IR, so emitted code always compiles)
 * or clearly-marked TODO comments. This is intentionally honest: roughly half
 * the seeded rules become real enforcement, the rest are surfaced as TODOs.
 */

export interface EntityRulePlan {
  entityKey: string;
  /** toStateKey -> guard code statements injected into the transition handler. */
  transitionGuards: Record<string, string[]>;
  /** Comment lines rendered at the top of the entity's service file. */
  notes: string[];
  /** Role keys that gate this entity's WRITE routes (from P3 access rules). */
  roleGuards: string[];
}

export interface RulePlan {
  perEntity: Record<string, EntityRulePlan>;
  /** Rules turned into real, compile-safe enforcement code (transition guards). */
  guardCount: number;
  /** Rules surfaced as advisory role notes or TODO comments for manual work. */
  flaggedCount: number;
}

const planFor = (plan: RulePlan, entityKey: string): EntityRulePlan => {
  if (!plan.perEntity[entityKey]) {
    plan.perEntity[entityKey] = { entityKey, transitionGuards: {}, notes: [], roleGuards: [] };
  }
  return plan.perEntity[entityKey];
};

const addGuard = (ep: EntityRulePlan, toState: string, code: string) => {
  (ep.transitionGuards[toState] ||= []).push(code);
};

const esc = (s: string) => s.replace(/'/g, "\\'");

/** Resolve the entity a free-text rule most likely targets (else the workflow entity). */
const resolveEntity = (ir: IR, text: string): EntityIR | undefined => {
  const lower = text.toLowerCase();
  for (const e of ir.entities) {
    const needles = [e.varName, ...e.label.toLowerCase().split(/\s+/), e.key].filter(Boolean);
    if (needles.some((n) => n.length > 2 && lower.includes(n))) return e;
  }
  return ir.entities.find((e) => e.isWorkflow) ?? ir.entities[0];
};

const findNumericAttr = (e?: EntityIR) =>
  e?.fields.find((f) => f.fieldType === 'number')?.attrName;

const findDateAttr = (e?: EntityIR) =>
  e?.fields.find((f) => f.fieldType === 'date')?.attrName;

/** Pick the transition whose to-state / label matches a keyword regex. */
const transitionTo = (ir: IR, re: RegExp): string | undefined => {
  const wf = ir.workflow;
  if (!wf) return undefined;
  const t = wf.transitions.find(
    (x) => re.test(x.to) || re.test(x.label) || re.test(labelOf(ir, x.to))
  );
  return t?.to;
};

const labelOf = (ir: IR, stateKey: string): string =>
  ir.workflow?.states.find((s) => s.key === stateKey)?.label ?? stateKey;

const UNIT_MS: Record<string, number> = {
  minute: 60_000,
  hour: 3_600_000,
  day: 86_400_000,
};

export const planRules = (ir: IR): RulePlan => {
  const plan: RulePlan = { perEntity: {}, guardCount: 0, flaggedCount: 0 };
  const wf = ir.entities.find((e) => e.isWorkflow);

  for (const rule of ir.rules) {
    const text = rule.text;
    let matched = false;

    // P1 — time window ("... at least 24 hours in advance / before").
    const tw = text.match(/(?:at least|within)\s+(\d+)\s*(minute|hour|day)s?\s+(?:in advance|before|prior)/i);
    if (tw && wf) {
      const n = parseInt(tw[1], 10);
      const unit = tw[2].toLowerCase();
      const ms = n * (UNIT_MS[unit] ?? UNIT_MS.hour);
      const toState = transitionTo(ir, /cancel/i);
      const dateAttr = findDateAttr(wf);
      if (toState && dateAttr) {
        addGuard(planFor(plan, wf.key), toState, [
          `// [FlowForge RULE] ${text}`,
          `const _scheduledMs = new Date(String((record as any).${dateAttr})).getTime();`,
          `if (!Number.isNaN(_scheduledMs) && _scheduledMs - Date.now() < ${ms}) {`,
          `  throw new AppError('This must be done at least ${n} ${unit}${n > 1 ? 's' : ''} in advance.', 400, 'RULE_VIOLATION');`,
          `}`,
        ].join('\n'));
        matched = true;
        plan.guardCount++;
      }
    }

    // P2 — field threshold ("... score above 60% ...").
    if (!matched) {
      const th = text.match(/(?:above|at least|minimum|greater than|exceeds?|threshold)\D*(\d+)/i);
      if (th && wf) {
        const threshold = parseInt(th[1], 10);
        const numAttr = findNumericAttr(wf);
        const toState = transitionTo(ir, /accept|admit|approv|pass|complet/i);
        if (numAttr && toState) {
          addGuard(planFor(plan, wf.key), toState, [
            `// [FlowForge RULE] ${text}`,
            `if (Number((record as any).${numAttr}) < ${threshold}) {`,
            `  throw new AppError('Does not meet the required threshold of ${threshold}.', 400, 'RULE_VIOLATION');`,
            `}`,
          ].join('\n'));
          matched = true;
          plan.guardCount++;
        }
      }
    }

    // P3 — role restriction ("Only Doctors can ...").
    if (!matched) {
      const rr = text.match(/only\s+(?:the\s+)?([a-z][a-z ]*?)s?\s+can\s+(.+)/i);
      if (rr) {
        const rolePhrase = rr[1].trim().toLowerCase();
        const role = ir.roles.find(
          (r) => r.name.toLowerCase().includes(rolePhrase) || rolePhrase.includes(r.name.toLowerCase())
        );
        const target = resolveEntity(ir, rr[2]);
        if (role && target) {
          const isWorkflowEntity = !!wf && target.key === wf.key;
          if (isWorkflowEntity) {
            // The workflow entity's role restrictions are already enforced by the
            // per-transition role guards — surface a note rather than double-guard
            // (a blanket route guard here would lock out roles that must transition it).
            planFor(plan, target.key).notes.push(
              `// [FlowForge RULE — enforced via transition role guards]: ${text}`
            );
            plan.flaggedCount++;
          } else {
            const ep = planFor(plan, target.key);
            if (!ep.roleGuards.includes(role.key)) ep.roleGuards.push(role.key);
            ep.notes.push(
              `// [FlowForge RULE — ENFORCED via requireRole('${esc(role.key)}') on ${target.varName} write routes]: ${text}`
            );
            plan.guardCount++;
          }
          matched = true;
        }
      }
    }

    // Unmatched or non-auto-enforceable (auto-actions, cross-entity preconditions).
    if (!matched) {
      const target = resolveEntity(ir, text) ?? wf ?? ir.entities[0];
      if (target) {
        planFor(plan, target.key).notes.push(`// [FlowForge RULE — NOT AUTO-ENFORCED]: ${text}`);
      }
      plan.flaggedCount++;
    }
  }

  return plan;
};

export const entityRulePlan = (plan: RulePlan, entityKey: string): EntityRulePlan =>
  plan.perEntity[entityKey] ?? { entityKey, transitionGuards: {}, notes: [], roleGuards: [] };
