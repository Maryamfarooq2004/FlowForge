import { EntityIR, FieldIR, IR } from '../types';
import { jsEnumList } from '../typeMap';
import { columnModel, indexesFor } from './ddl';
import { lines, withTrailingNewline } from './helpers';

/** DataTypes.X -> Sequelize.X for use inside sequelize-cli migrations. */
const seqType = (sequelizeType: string): string =>
  sequelizeType.replace('DataTypes.', 'Sequelize.');

const columnField = (f: FieldIR): string => {
  const c = columnModel(f);
  const opts: string[] = [`type: ${seqType(f.sequelizeType)}`, `allowNull: ${!c.notNull}`];
  if (c.defaultValue !== undefined) opts.push(`defaultValue: ${c.defaultValue}`);
  if (c.unique) opts.push(`unique: true`);
  if (c.ref) {
    opts.push(`references: { model: '${c.ref.targetTable}', key: 'id' }`);
    opts.push(`onUpdate: '${c.ref.onUpdate}'`);
    opts.push(`onDelete: '${c.ref.onDelete}'`);
  }
  return `        ${c.name}: { ${opts.join(', ')} },`;
};

/** addIndex calls for an entity's foreign keys / declared-unique columns. */
const indexCalls = (e: EntityIR): string =>
  indexesFor(e)
    .map(
      (i) =>
        `      await queryInterface.addIndex('${i.table}', ['${i.column}'], ` +
        `{ name: '${i.name}'${i.unique ? ', unique: true' : ''} });`
    )
    .join('\n');

const auditFields = lines(
  `        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },`,
  `        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },`
);

/** CHECK constraints for enum columns, added after the table is created. */
const checkConstraints = (e: EntityIR): string => {
  const checks = e.fields
    .filter((f) => f.enumValues && f.enumValues.length)
    .map(
      (f) =>
        `      await queryInterface.addConstraint('${e.tableName}', {\n` +
        `        fields: ['${f.columnName}'],\n` +
        `        type: 'check',\n` +
        `        name: '${e.tableName}_${f.columnName}_chk',\n` +
        `        where: { ${f.columnName}: ${jsEnumList(f.enumValues!)} },\n` +
        `      });`
    );
  return checks.join('\n');
};

/** Render a numbered migration file for one entity table. */
export const renderMigration = (e: EntityIR, _ir: IR): string => {
  const body = lines(
    `'use strict';`,
    `// FlowForge generated migration — create "${e.tableName}".`,
    ``,
    `module.exports = {`,
    `  async up(queryInterface, Sequelize) {`,
    `    await queryInterface.createTable('${e.tableName}', {`,
    `        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },`,
    e.fields.map(columnField).join('\n'),
    auditFields,
    `    });`,
    checkConstraints(e),
    indexCalls(e),
    `  },`,
    ``,
    `  async down(queryInterface) {`,
    `    await queryInterface.dropTable('${e.tableName}');`,
    `  },`,
    `};`
  );
  return withTrailingNewline(body);
};

/** Render the first migration (000) — the auth `users` table. */
export const renderUsersMigration = (ir: IR): string => {
  const body = lines(
    `'use strict';`,
    `// FlowForge generated migration — create "users" (authentication).`,
    ``,
    `module.exports = {`,
    `  async up(queryInterface, Sequelize) {`,
    `    await queryInterface.createTable('users', {`,
    `        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },`,
    `        email: { type: Sequelize.STRING(255), allowNull: false, unique: true },`,
    `        password: { type: Sequelize.STRING(255), allowNull: false },`,
    `        full_name: { type: Sequelize.STRING(255), allowNull: true },`,
    `        role: { type: Sequelize.STRING(64), allowNull: false },`,
    auditFields,
    `    });`,
    `      await queryInterface.addConstraint('users', {`,
    `        fields: ['role'],`,
    `        type: 'check',`,
    `        name: 'users_role_chk',`,
    `        where: { role: ${jsEnumList(ir.roleKeys)} },`,
    `      });`,
    `  },`,
    ``,
    `  async down(queryInterface) {`,
    `    await queryInterface.dropTable('users');`,
    `  },`,
    `};`
  );
  return withTrailingNewline(body);
};

/** Zero-padded migration file name, e.g. "002-create-appointments.js". */
export const migrationFileName = (index: number, tableOrName: string): string =>
  `${String(index).padStart(3, '0')}-create-${tableOrName}.js`;
