import { IR, StageResult } from '../types';
import { RulePlan } from '../rules/ruleEngine';

/** Read-only context handed to every pipeline stage. */
export interface StageContext {
  ir: IR;
  rulePlan: RulePlan;
}

/** A pipeline stage descriptor with its progress band. */
export interface StageDescriptor {
  index: number; // 1–6
  name: string;
  percentStart: number;
  percentEnd: number;
  run: (ctx: StageContext) => StageResult;
}
