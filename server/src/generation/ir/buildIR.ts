import {
  SpecEntity,
  SpecField,
  SpecRole,
  SpecState,
  SpecTransition,
  SpecRule,
} from '../../types/spec.types';
import {
  IR,
  EntityIR,
  FieldIR,
  WorkflowIR,
  RoleIR,
  ThemeIR,
} from '../types';
import {
  pascal,
  camel,
  snake,
  tableName,
  routeBase,
  camelPlural,
  safeColumn,
  dedupeColumn,
  columnToAttr,
  packageName,
} from '../naming';
import {
  baseTypeMapping,
  enumTypeMapping,
  referenceTypeMapping,
  sqlEnumList,
  jsEnumList,
} from '../typeMap';

/** A configured alert fed into the generator (from the spec or NotificationConfig). */
export interface SpecInputTrigger {
  event: string;
  channel: 'email' | 'in-app' | 'both';
  description?: string;
  enabled?: boolean;
}

/** The subset of an (approved) WorkflowSpec the generator consumes. */
export interface SpecInput {
  domain: 'clinic' | 'school';
  entities: SpecEntity[];
  roles: SpecRole[];
  states: SpecState[];
  transitions: SpecTransition[];
  businessRules: SpecRule[];
  notificationTriggers?: SpecInputTrigger[];
  theme?: ThemeIR;
}

/** Brand palette used when a project has no saved theme (mirrors DEFAULT_THEME). */
const DEFAULT_THEME_IR: ThemeIR = {
  colors: { primary: '#0F766E', secondary: '#4F46E5', accent: '#34D399' },
  fonts: { heading: 'Poppins', body: 'Inter' },
};

const STATUS_FIELD = (name: string) => name.trim().toLowerCase() === 'status';

/** Build the FieldIR list for one entity, resolving names, types and FKs. */
const buildFields = (
  entity: SpecEntity,
  specIndex: number,
  entityByKeyRaw: Record<string, SpecEntity>,
  isWorkflow: boolean,
  stateKeys: string[],
  initialStateKey: string
): FieldIR[] => {
  const used = new Set<string>(['id', 'created_at', 'updated_at']);
  const fields: FieldIR[] = [];

  const makeField = (f: SpecField): FieldIR => {
    const isReference = f.type === 'reference' && !!f.reference;
    const candidate = safeColumn(isReference ? `${snake(f.name)}_id` : snake(f.name));
    const columnName = dedupeColumn(candidate, used);
    const attrName = columnToAttr(columnName);
    const required = !!f.required;
    const isStatus = isWorkflow && STATUS_FIELD(f.name);

    // Workflow status column: driven by the state machine, not the authored enum.
    if (isStatus) {
      return {
        specName: f.name,
        columnName: 'status',
        attrName: 'status',
        fieldType: 'enum',
        required: true,
        sqlType: 'VARCHAR(64)',
        sqlCheck: `"status" IN (${sqlEnumList(stateKeys)})`,
        sequelizeType: 'DataTypes.STRING(64)',
        allowNull: false,
        defaultValue: `'${initialStateKey}'`,
        validator: `.isIn(${jsEnumList(stateKeys)})`,
        enumValues: stateKeys,
        isStatus: true,
      };
    }

    if (isReference) {
      const target = entityByKeyRaw[f.reference as string];
      const ref = referenceTypeMapping();
      return {
        specName: f.name,
        columnName,
        attrName,
        fieldType: 'reference',
        required,
        sqlType: ref.sqlType,
        sequelizeType: ref.sequelizeType,
        allowNull: !required,
        validator: ref.validatorFragment,
        ref: target
          ? {
              targetKey: target.key,
              targetModel: pascal(target.name),
              targetTable: tableName(target.name),
              fkColumn: columnName,
              fkAttr: attrName,
              belongsToAlias: camel(f.name),
              hasManyAlias: camelPlural(entity.name),
            }
          : undefined,
      };
    }

    if (f.type === 'enum') {
      const options = f.options ?? [];
      const map = enumTypeMapping(options);
      return {
        specName: f.name,
        columnName,
        attrName,
        fieldType: 'enum',
        required,
        sqlType: map.sqlType,
        sqlCheck: options.length ? `"${columnName}" IN (${sqlEnumList(options)})` : undefined,
        sequelizeType: map.sequelizeType,
        allowNull: !required,
        validator: map.validatorFragment,
        enumValues: options,
        unique: !!f.unique,
      };
    }

    const map = baseTypeMapping(f.type as any);
    return {
      specName: f.name,
      columnName,
      attrName,
      fieldType: f.type,
      required,
      sqlType: map.sqlType,
      sequelizeType: map.sequelizeType,
      allowNull: !required,
      validator: map.validatorFragment,
      unique: !!f.unique,
    };
  };

  for (const f of entity.fields) fields.push(makeField(f));

  // Synthesize a status column if the workflow entity lacks one (the validator
  // only warns about this; approval does not guarantee it).
  if (isWorkflow && !fields.some((f) => f.isStatus)) {
    dedupeColumn('status', used);
    fields.push({
      specName: 'Status',
      columnName: 'status',
      attrName: 'status',
      fieldType: 'enum',
      required: true,
      sqlType: 'VARCHAR(64)',
      sqlCheck: `"status" IN (${sqlEnumList(stateKeys)})`,
      sequelizeType: 'DataTypes.STRING(64)',
      allowNull: false,
      defaultValue: `'${initialStateKey}'`,
      validator: `.isIn(${jsEnumList(stateKeys)})`,
      enumValues: stateKeys,
      isStatus: true,
    });
  }

  return fields;
};

/**
 * Order entities so every referenced table is created before the table that
 * references it (Kahn topological sort). Self-references are ignored; ties are
 * broken by original spec index for byte-stable output.
 */
const topoSort = (entities: EntityIR[]): EntityIR[] => {
  const byKey = new Map(entities.map((e) => [e.key, e]));
  const indegree = new Map<string, number>(entities.map((e) => [e.key, 0]));
  const successors = new Map<string, string[]>(entities.map((e) => [e.key, []]));

  for (const e of entities) {
    for (const f of e.fields) {
      const target = f.ref?.targetKey;
      if (target && target !== e.key && byKey.has(target)) {
        successors.get(target)!.push(e.key);
        indegree.set(e.key, (indegree.get(e.key) || 0) + 1);
      }
    }
  }

  const bySpecIndex = (a: string, b: string) =>
    byKey.get(a)!.specIndex - byKey.get(b)!.specIndex;

  const queue = entities
    .filter((e) => (indegree.get(e.key) || 0) === 0)
    .map((e) => e.key)
    .sort(bySpecIndex);

  const ordered: EntityIR[] = [];
  while (queue.length) {
    const key = queue.shift()!;
    ordered.push(byKey.get(key)!);
    const next: string[] = [];
    for (const s of successors.get(key)!) {
      indegree.set(s, (indegree.get(s) || 0) - 1);
      if ((indegree.get(s) || 0) === 0) next.push(s);
    }
    queue.push(...next);
    queue.sort(bySpecIndex);
  }

  // Cycle fallback: append anything left in stable spec order (emitter then
  // relies on Postgres deferring FK checks — no domain hits this path).
  if (ordered.length < entities.length) {
    const seen = new Set(ordered.map((e) => e.key));
    for (const e of [...entities].sort((a, b) => a.specIndex - b.specIndex)) {
      if (!seen.has(e.key)) ordered.push(e);
    }
  }
  return ordered;
};

const buildWorkflow = (
  entities: EntityIR[],
  states: SpecState[],
  transitions: SpecTransition[]
): WorkflowIR | undefined => {
  const wf = entities.find((e) => e.isWorkflow);
  if (!wf || states.length === 0) return undefined;

  const sorted = [...states].sort((a, b) => a.order - b.order);
  const initial = sorted.find((s) => s.isInitial) ?? sorted[0];

  return {
    entityKey: wf.key,
    entityModel: wf.modelName,
    entityRouteBase: wf.routeBase,
    statusColumn: 'status',
    statusAttr: 'status',
    states: sorted.map((s) => ({
      key: s.key,
      label: s.label,
      isInitial: !!s.isInitial,
      isFinal: !!s.isFinal,
    })),
    stateKeys: sorted.map((s) => s.key),
    initialStateKey: initial.key,
    transitions: transitions.map((t) => ({
      from: t.from,
      to: t.to,
      label: t.label,
      roleKey: t.role,
    })),
  };
};

const buildRoles = (roles: SpecRole[]): { roles: RoleIR[]; matrix: Record<string, Record<string, boolean>> } => {
  const irRoles: RoleIR[] = roles.map((r) => ({
    key: r.key,
    name: r.name,
    description: r.description,
    permissions: r.permissions.map((p) => ({ action: p.action, allowed: p.allowed })),
  }));
  const matrix: Record<string, Record<string, boolean>> = {};
  for (const r of irRoles) {
    matrix[r.key] = {};
    for (const p of r.permissions) matrix[r.key][p.action] = p.allowed;
  }
  return { roles: irRoles, matrix };
};

/** Turn an approved spec + project name into the read-only generator IR. */
export const buildIR = (spec: SpecInput, projectName: string): IR => {
  const sortedStates = [...spec.states].sort((a, b) => a.order - b.order);
  const stateKeys = sortedStates.map((s) => s.key);
  const initialStateKey = (sortedStates.find((s) => s.isInitial) ?? sortedStates[0])?.key ?? '';

  const entityByKeyRaw: Record<string, SpecEntity> = {};
  for (const e of spec.entities) entityByKeyRaw[e.key] = e;

  const entitiesSpecOrder: EntityIR[] = spec.entities.map((e, i) => {
    const isWorkflow = !!e.isWorkflowEntity;
    return {
      key: e.key,
      specIndex: i,
      modelName: pascal(e.name),
      tableName: tableName(e.name),
      routeBase: routeBase(e.name),
      varName: camel(e.name),
      label: e.label,
      description: e.description,
      isWorkflow,
      fields: buildFields(e, i, entityByKeyRaw, isWorkflow, stateKeys, initialStateKey),
    };
  });

  const entities = topoSort(entitiesSpecOrder);
  const entityByKey: Record<string, EntityIR> = {};
  for (const e of entities) entityByKey[e.key] = e;

  const { roles, matrix } = buildRoles(spec.roles);
  const workflow = buildWorkflow(entities, spec.states, spec.transitions);

  const notificationTriggers = (spec.notificationTriggers ?? []).map((t) => ({
    event: t.event,
    channel: t.channel,
    description: t.description,
    enabled: t.enabled !== false,
  }));

  return {
    appName: packageName(projectName),
    domain: spec.domain,
    entities,
    entityByKey,
    roles,
    roleKeys: roles.map((r) => r.key),
    permissionMatrix: matrix,
    workflow,
    rules: spec.businessRules,
    notificationTriggers,
    theme: spec.theme
      ? { colors: { ...spec.theme.colors }, fonts: { ...spec.theme.fonts } }
      : DEFAULT_THEME_IR,
  };
};
