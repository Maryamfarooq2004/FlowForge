import { buildIR, SpecInput } from './ir/buildIR';
import { planRules } from './rules/ruleEngine';
import { STAGES, StageContext } from './stages';
import { FileArtifact, StageLog } from './types';

/** Build the read-only context (IR + rule plan) every stage consumes. */
export const buildContext = (spec: SpecInput, projectName: string): StageContext => {
  const ir = buildIR(spec, projectName);
  const rulePlan = planRules(ir);
  return { ir, rulePlan };
};

export interface GeneratedOutput {
  artifacts: FileArtifact[]; // sorted by path — deterministic
  logs: StageLog[];
}

/**
 * Run every stage and merge their outputs into the final artifact set
 * (last-writer-wins per path, then sorted). Pure & deterministic — this is what
 * the golden/compile tests exercise and what the orchestrator persists.
 */
export const runAllStages = (ctx: StageContext): GeneratedOutput => {
  const byPath = new Map<string, string>();
  const logs: StageLog[] = [];
  for (const stage of STAGES) {
    const res = stage.run(ctx);
    for (const a of res.artifacts) byPath.set(a.path, a.contents);
    logs.push(...res.logs);
  }
  const artifacts = [...byPath.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([path, contents]) => ({ path, contents }));
  return { artifacts, logs };
};

/** Convenience: spec → deterministic artifact set. */
export const generateArtifacts = (spec: SpecInput, projectName: string): GeneratedOutput =>
  runAllStages(buildContext(spec, projectName));

export { SpecInput };
