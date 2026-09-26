import { EntityIR, FieldIR } from '../types';

/**
 * The SINGLE derivation of a column's DDL.
 *
 * `schema.ts` (schema.sql) and `migration.ts` (sequelize-cli migrations) describe
 * the same database. They used to derive it independently and had already drifted:
 * the migration emitted ON DELETE / ON UPDATE while schema.sql emitted a bare
 * REFERENCES. Both now render from this, so they cannot disagree again.
 */
export interface ColumnModel {
  name: string;
  sqlType: string;
  notNull: boolean;
  defaultValue?: string;
  unique: boolean;
  check?: string;
  ref?: {
    targetTable: string;
    onDelete: 'RESTRICT' | 'SET NULL';
    onUpdate: 'CASCADE';
  };
}

export interface IndexModel {
  name: string;
  table: string;
  column: string;
  unique: boolean;
}

export const columnModel = (f: FieldIR): ColumnModel => ({
  name: f.columnName,
  sqlType: f.sqlType,
  notNull: !f.allowNull,
  defaultValue: f.defaultValue,
  // Never inferred — only what the user declared on the field (see planning/12 §2).
  unique: !!f.unique,
  check: f.sqlCheck,
  ref: f.ref
    ? {
        targetTable: f.ref.targetTable,
        // A required link must not be silently broken; an optional one may be cleared.
        onDelete: f.allowNull ? 'SET NULL' : 'RESTRICT',
        onUpdate: 'CASCADE',
      }
    : undefined,
});

/**
 * Every foreign-key column gets an index — an unindexed FK turns every join and
 * every cascade check into a sequential scan. Declared-unique columns get a
 * unique index instead (which also serves as the lookup index).
 */
export const indexesFor = (e: EntityIR): IndexModel[] => {
  const out: IndexModel[] = [];
  for (const f of e.fields) {
    if (f.ref) {
      out.push({
        name: `${e.tableName}_${f.columnName}_idx`,
        table: e.tableName,
        column: f.columnName,
        unique: false,
      });
    } else if (f.unique) {
      out.push({
        name: `${e.tableName}_${f.columnName}_uniq`,
        table: e.tableName,
        column: f.columnName,
        unique: true,
      });
    }
  }
  return out;
};
