import { StageContext } from './stage';
import { StageResult, StageLog } from '../types';
import { renderSchema } from '../templates/schema';

/** Stage 1 — WorkflowSpec entities → 3NF PostgreSQL DDL. */
export const generateSchemaStage = ({ ir }: StageContext): StageResult => {
  const logs: StageLog[] = [
    { level: 'info', message: `Validating WorkflowSpec — ${ir.entities.length} collections, ${ir.roleKeys.length} roles.` },
    ...ir.entities.map((e) => ({
      level: 'info' as const,
      message: `Table "${e.tableName}" (${e.fields.length + 3} columns)`,
    })),
    {
      level: 'success',
      message: `PostgreSQL schema generated (${ir.entities.length + 1} tables in dependency order).`,
    },
  ];
  return { artifacts: [{ path: 'schema.sql', contents: renderSchema(ir) }], logs };
};
