import { EntityIR, FieldIR, IR } from '../types';
import { jsEnumList } from '../typeMap';
import { banner, lines, withTrailingNewline } from './helpers';

/** Render one attribute definition line for a Sequelize .init() call. */
const attrLine = (f: FieldIR): string => {
  const opts: string[] = [`type: ${f.sequelizeType}`, `allowNull: ${f.allowNull}`];
  if (f.unique) opts.push(`unique: true`);
  if (f.defaultValue !== undefined) opts.push(`defaultValue: ${f.defaultValue}`);
  opts.push(`field: '${f.columnName}'`);
  if (f.ref) {
    opts.push(`references: { model: '${f.ref.targetTable}', key: 'id' }`);
  }
  if (f.enumValues && f.enumValues.length) {
    opts.push(`validate: { isIn: [${jsEnumList(f.enumValues)}] }`);
  }
  return `    ${f.attrName}: { ${opts.join(', ')} },`;
};

/** Render `src/models/<Model>.model.ts`. */
export const renderModel = (e: EntityIR, _ir: IR): string => {
  const body = lines(
    banner(`Model: ${e.modelName} (table "${e.tableName}")`),
    `import { DataTypes, Model } from 'sequelize';`,
    `import { sequelize } from '../config/database';`,
    ``,
    `export class ${e.modelName} extends Model {}`,
    ``,
    `${e.modelName}.init(`,
    `  {`,
    `    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },`,
    e.fields.map(attrLine).join('\n'),
    `  },`,
    `  {`,
    `    sequelize,`,
    `    modelName: '${e.modelName}',`,
    `    tableName: '${e.tableName}',`,
    `    underscored: true,`,
    `    timestamps: true,`,
    `  }`,
    `);`,
    ``,
    `export default ${e.modelName};`
  );
  return withTrailingNewline(body);
};

/** Render `src/models/index.ts` — constructs models then wires all associations. */
export const renderModelIndex = (ir: IR): string => {
  const imports = lines(
    banner('Model registry & associations (wired after all models are constructed).'),
    `import { sequelize } from '../config/database';`,
    `import { User } from './User.model';`,
    `import { Notification } from './Notification.model';`,
    ...ir.entities.map((e) => `import { ${e.modelName} } from './${e.modelName}.model';`)
  );

  const assoc: string[] = [];
  for (const e of ir.entities) {
    for (const f of e.fields) {
      if (!f.ref) continue;
      const target = ir.entityByKey[f.ref.targetKey];
      if (!target) continue;
      assoc.push(
        `${e.modelName}.belongsTo(${target.modelName}, { foreignKey: '${f.ref.fkAttr}', as: '${f.ref.belongsToAlias}' });`
      );
      assoc.push(
        `${target.modelName}.hasMany(${e.modelName}, { foreignKey: '${f.ref.fkAttr}', as: '${f.ref.hasManyAlias}' });`
      );
    }
  }

  const exportsList = ['User', 'Notification', ...ir.entities.map((e) => e.modelName)].join(', ');

  const body = lines(
    imports,
    ``,
    assoc.length ? '// ── Associations ──' : '// (no associations)',
    ...assoc,
    ``,
    `export { sequelize, ${exportsList} };`
  );
  return withTrailingNewline(body);
};
