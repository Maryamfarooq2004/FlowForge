import { StageDescriptor } from './stage';
import { generateSchemaStage } from './schema.generator';
import { generateOrmStage } from './orm.generator';
import { generateApiStage } from './api.generator';
import { generateWorkflowStage } from './workflow.generator';
import { generateRulesStage } from './rules.generator';
import { generateFrontendStage } from './frontend.generator';
import { generateBundlerStage } from './bundler.generator';

/**
 * The deterministic full-stack pipeline. Percent bands are scaled so the run
 * reaches ~98% after the Bundler stage; the orchestrator's finalize step brings
 * it to 100.
 */
export const STAGES: StageDescriptor[] = [
  { index: 1, name: 'Database Schema', percentStart: 0, percentEnd: 14, run: generateSchemaStage },
  { index: 2, name: 'ORM Models & Migrations', percentStart: 14, percentEnd: 30, run: generateOrmStage },
  { index: 3, name: 'REST API', percentStart: 30, percentEnd: 50, run: generateApiStage },
  { index: 4, name: 'Workflow Endpoints', percentStart: 50, percentEnd: 64, run: generateWorkflowStage },
  { index: 5, name: 'Business Rules & RBAC', percentStart: 64, percentEnd: 76, run: generateRulesStage },
  { index: 6, name: 'React Frontend', percentStart: 76, percentEnd: 92, run: generateFrontendStage },
  { index: 7, name: 'Deploy Bundle', percentStart: 92, percentEnd: 98, run: generateBundlerStage },
];

export { StageDescriptor, StageContext } from './stage';
