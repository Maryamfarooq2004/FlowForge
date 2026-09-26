import { FieldType } from '../types/spec.types';

/**
 * Maps a WorkflowSpec FieldType to its PostgreSQL column type, Sequelize
 * DataType, and an express-validator chain fragment.
 *
 * Correctness notes:
 *  - date -> Sequelize DATEONLY (plain DATE), NOT DATE (which is timestamptz).
 *  - time -> Sequelize TIME (time without time zone).
 *  - currency -> DECIMAL(12,2); pg returns DECIMAL as a string (precision).
 *  - enum is handled by the caller (needs the options) via CHECK + isIn.
 */

export interface BaseTypeMapping {
  sqlType: string;
  sequelizeType: string;
  /** validator fragment appended after the field accessor, e.g. ".isEmail()". */
  validatorFragment: string;
}

const MAP: Record<Exclude<FieldType, 'enum' | 'reference'>, BaseTypeMapping> = {
  text: {
    sqlType: 'VARCHAR(255)',
    sequelizeType: 'DataTypes.STRING',
    validatorFragment: `.isString().trim().isLength({ max: 255 })`,
  },
  richtext: {
    sqlType: 'TEXT',
    sequelizeType: 'DataTypes.TEXT',
    validatorFragment: `.isString()`,
  },
  number: {
    sqlType: 'INTEGER',
    sequelizeType: 'DataTypes.INTEGER',
    validatorFragment: `.isInt().toInt()`,
  },
  currency: {
    sqlType: 'NUMERIC(12,2)',
    sequelizeType: 'DataTypes.DECIMAL(12, 2)',
    validatorFragment: `.isFloat({ min: 0 }).toFloat()`,
  },
  date: {
    sqlType: 'DATE',
    sequelizeType: 'DataTypes.DATEONLY',
    validatorFragment: `.isISO8601()`,
  },
  time: {
    sqlType: 'TIME',
    sequelizeType: 'DataTypes.TIME',
    validatorFragment: `.matches(/^\\d{2}:\\d{2}(:\\d{2})?$/)`,
  },
  boolean: {
    sqlType: 'BOOLEAN',
    sequelizeType: 'DataTypes.BOOLEAN',
    validatorFragment: `.isBoolean().toBoolean()`,
  },
  phone: {
    sqlType: 'VARCHAR(32)',
    sequelizeType: 'DataTypes.STRING(32)',
    validatorFragment: `.isString().matches(/^[+0-9 ()-]{6,}$/)`,
  },
  email: {
    sqlType: 'VARCHAR(255)',
    sequelizeType: 'DataTypes.STRING(255)',
    validatorFragment: `.isEmail().normalizeEmail()`,
  },
};

export const baseTypeMapping = (
  type: Exclude<FieldType, 'enum' | 'reference'>
): BaseTypeMapping => MAP[type];

/** SQL literal-list for an enum CHECK / isIn, e.g. `'Cash', 'Card'`. */
export const sqlEnumList = (options: string[]): string =>
  options.map((o) => `'${o.replace(/'/g, "''")}'`).join(', ');

/** JS array literal for Sequelize isIn / validators, e.g. ['Cash', 'Card']. */
export const jsEnumList = (options: string[]): string =>
  '[' + options.map((o) => `'${o.replace(/'/g, "\\'")}'`).join(', ') + ']';

/** Enum column mapping given resolved options (VARCHAR + CHECK, not native ENUM). */
export const enumTypeMapping = (options: string[]): BaseTypeMapping => ({
  sqlType: 'VARCHAR(64)',
  sequelizeType: 'DataTypes.STRING(64)',
  validatorFragment: `.isIn(${jsEnumList(options)})`,
});

/** Reference (FK) column mapping — always an INTEGER pointing at another table. */
export const referenceTypeMapping = (): BaseTypeMapping => ({
  sqlType: 'INTEGER',
  sequelizeType: 'DataTypes.INTEGER',
  validatorFragment: `.isInt().toInt()`,
});
