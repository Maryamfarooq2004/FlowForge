import { StageContext } from './stage';
import { FileArtifact, StageResult, StageLog } from '../types';
import { renderWorkflowConfig } from '../templates/config';
import { renderService, renderController, renderRoutes } from '../templates/entityApi';

/**
 * Stage 4 — the state machine config plus the workflow entity's API, which
 * carries the `/transition` endpoint (enforces the current state and the
 * transition's role).
 */
export const generateWorkflowStage = ({ ir, rulePlan }: StageContext): StageResult => {
  const artifacts: FileArtifact[] = [
    { path: 'src/config/workflow.ts', contents: renderWorkflowConfig(ir) },
  ];
  const logs: StageLog[] = [];

  const wf = ir.entities.find((e) => e.isWorkflow);
  if (wf && ir.workflow) {
    artifacts.push(
      { path: `src/services/${wf.varName}.service.ts`, contents: renderService(wf, ir, rulePlan) },
      { path: `src/controllers/${wf.varName}.controller.ts`, contents: renderController(wf, ir) },
      { path: `src/routes/${wf.varName}.routes.ts`, contents: renderRoutes(wf, ir, rulePlan) }
    );
    logs.push(
      {
        level: 'info',
        message: `State machine: ${ir.workflow.states.map((s) => s.label).join(' → ')}`,
      },
      {
        level: 'success',
        message: `Workflow API for ${wf.modelName} built (${ir.workflow.transitions.length} transitions, role-guarded).`,
      }
    );
  } else {
    logs.push({ level: 'info', message: 'No workflow entity in this spec — skipping transition endpoints.' });
  }

  return { artifacts, logs };
};
