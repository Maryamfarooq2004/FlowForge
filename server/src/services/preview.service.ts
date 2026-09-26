import { v4 as uuidv4 } from 'uuid';
import { PreviewSandbox, PreviewRecord } from '../models/PreviewSandbox.model';
import { WorkflowSpec } from '../models/WorkflowSpec.model';
import { Project } from '../models/Project.model';
import { AppError } from '../utils/AppError';
import { buildContext } from '../generation/generate';
import { SpecInput } from '../generation/ir/buildIR';
import { IR, EntityIR } from '../generation/types';
import { getPreviewTheme } from './theme.service';
import {
  PreviewSpecMeta,
  PreviewEntityMeta,
  PreviewWorkflowMeta,
  PreviewState,
  DEFAULT_THEME,
} from '../types/preview.types';

// ── Resolved-IR access (recomputed from the immutable approved spec, memoized) ──

const irCache = new Map<string, IR>();

const assertProject = async (userId: string, projectId: string) => {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) throw new AppError('Project not found.', 404, 'NOT_FOUND');
  return project;
};

const getIR = async (userId: string, projectId: string) => {
  const project = await assertProject(userId, projectId);
  const spec = await WorkflowSpec.findOne({ projectId, userId });
  if (!spec) throw new AppError('Blueprint not generated yet.', 404, 'SPEC_NOT_FOUND');
  if (spec.status !== 'approved') {
    throw new AppError('Approve the blueprint before previewing.', 400, 'SPEC_NOT_APPROVED');
  }

  const cacheKey = `${String(spec._id)}:${spec.version}`;
  let ir = irCache.get(cacheKey);
  if (!ir) {
    const specInput: SpecInput = {
      domain: spec.domain,
      entities: spec.entities,
      roles: spec.roles,
      states: spec.states,
      transitions: spec.transitions,
      businessRules: spec.businessRules,
    };
    ir = buildContext(specInput, project.name).ir;
    irCache.set(cacheKey, ir);
  }
  return { ir, spec, project };
};

// ── IR → renderer meta DTO ──

const displayFieldAttr = (entity: EntityIR): string => {
  const text = entity.fields.find((f) => f.fieldType === 'text' && !f.isStatus);
  if (text) return text.attrName;
  const nonRef = entity.fields.find((f) => !f.isStatus && !f.ref);
  return nonRef?.attrName ?? entity.fields.find((f) => !f.isStatus)?.attrName ?? 'id';
};

export const buildMeta = (ir: IR, appLabel: string): PreviewSpecMeta => ({
  domain: ir.domain,
  appLabel,
  entities: ir.entities.map((e) => ({
    key: e.key,
    label: e.label,
    modelName: e.modelName,
    routeBase: e.routeBase,
    isWorkflow: e.isWorkflow,
    displayFieldAttr: displayFieldAttr(e),
    fields: e.fields.map((f) => ({
      specName: f.specName,
      attrName: f.attrName,
      fieldType: f.fieldType,
      required: f.required,
      enumValues: f.enumValues,
      isStatus: f.isStatus,
      ref: f.ref
        ? { targetKey: f.ref.targetKey, targetLabel: ir.entityByKey[f.ref.targetKey]?.label ?? f.ref.targetModel }
        : undefined,
    })),
  })),
  roles: ir.roles.map((r) => ({ key: r.key, name: r.name })),
  workflow: ir.workflow
    ? {
        entityKey: ir.workflow.entityKey,
        statusAttr: ir.workflow.statusAttr,
        initialStateKey: ir.workflow.initialStateKey,
        states: ir.workflow.states.map((s) => ({ key: s.key, label: s.label, isInitial: s.isInitial, isFinal: s.isFinal })),
        transitions: ir.workflow.transitions.map((t) => ({ from: t.from, to: t.to, label: t.label, roleKey: t.roleKey })),
      }
    : undefined,
  theme: DEFAULT_THEME,
});

// ── Pure, DB-free helpers (unit-tested without Mongo) ──

const isEmpty = (v: any) => v === undefined || v === null || v === '';

const coerce = (fieldType: string, value: any): any => {
  if (fieldType === 'number' || fieldType === 'currency') {
    const n = Number(value);
    if (Number.isNaN(n)) throw new AppError('Expected a number.', 400, 'VALIDATION_ERROR');
    return n;
  }
  if (fieldType === 'boolean') return value === true || value === 'true';
  return value;
};

/**
 * Validate a create/update payload against the entity's fields and return a
 * cleaned data object (excludes the workflow status — that changes only via
 * transitions). Throws AppError on the first violation.
 */
export const validateRecord = (
  entity: PreviewEntityMeta,
  input: Record<string, any>,
  records: Record<string, PreviewRecord[]>
): Record<string, any> => {
  const data: Record<string, any> = {};
  for (const f of entity.fields) {
    if (f.isStatus) continue;
    const v = input[f.attrName];
    if (isEmpty(v)) {
      if (f.required) throw new AppError(`${f.specName} is required.`, 400, 'VALIDATION_ERROR');
      continue;
    }
    if (f.fieldType === 'enum' && f.enumValues && !f.enumValues.includes(v)) {
      throw new AppError(`${f.specName} must be one of: ${f.enumValues.join(', ')}.`, 400, 'VALIDATION_ERROR');
    }
    if (f.ref) {
      const target = records[f.ref.targetKey] ?? [];
      if (!target.some((r) => r.id === v)) {
        throw new AppError(`The selected ${f.ref.targetLabel} does not exist.`, 400, 'VALIDATION_ERROR');
      }
    }
    data[f.attrName] = coerce(f.fieldType, v);
  }
  return data;
};

/** Enforce a workflow transition on a record (mirrors the generated backend). */
export const applyTransition = (
  workflow: PreviewWorkflowMeta,
  record: PreviewRecord,
  to: string,
  activeRoleKey: string
): PreviewRecord => {
  if (!workflow.states.some((s) => s.key === to)) {
    throw new AppError('Unknown target state.', 422, 'VALIDATION_ERROR');
  }
  const current = String(record.status);
  const t = workflow.transitions.find((x) => x.from === current && x.to === to);
  if (!t) {
    const allowed = workflow.transitions.filter((x) => x.from === current).map((x) => x.label).join(', ') || 'none';
    throw new AppError(`Cannot move from '${current}' to '${to}'. Allowed: ${allowed}.`, 400, 'INVALID_TRANSITION');
  }
  if (t.roleKey && t.roleKey !== activeRoleKey) {
    throw new AppError(`Only the '${t.roleKey}' role can perform this action.`, 403, 'ROLE_NOT_ALLOWED');
  }
  record.status = to;
  record.updatedAt = new Date().toISOString();
  return record;
};

// Field-type-aware demo values for seeding.
const NAME_POOL = ['Ayesha Khan', 'Bilal Ahmed', 'Fatima Noor', 'Hassan Raza', 'Sana Malik', 'Usman Tariq'];
const WORD_POOL = ['Alpha', 'Bravo', 'Delta', 'Omega', 'Prime', 'Nova'];

const isoDateOffset = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const fakeValue = (
  field: PreviewEntityMeta['fields'][number],
  i: number,
  records: Record<string, PreviewRecord[]>
): any => {
  const nameLike = /name|title|patient|student|guardian/i.test(field.specName);
  switch (field.fieldType) {
    case 'text':
      return nameLike ? NAME_POOL[i % NAME_POOL.length] : `${WORD_POOL[i % WORD_POOL.length]} ${field.specName}`;
    case 'richtext':
      return `Sample ${field.specName.toLowerCase()} for demo record ${i + 1}.`;
    case 'number':
      return (i + 1) * 7;
    case 'currency':
      return (i + 1) * 500;
    case 'date':
      return isoDateOffset(i + 1);
    case 'time':
      return `${String(9 + i).padStart(2, '0')}:00`;
    case 'boolean':
      return i % 2 === 0;
    case 'enum':
      return field.enumValues && field.enumValues.length ? field.enumValues[i % field.enumValues.length] : undefined;
    case 'phone':
      return `+92300${String(1000000 + i).slice(0, 7)}`;
    case 'email':
      return `demo${i + 1}@example.com`;
    case 'reference': {
      const target = field.ref ? records[field.ref.targetKey] ?? [] : [];
      return target.length ? target[i % target.length].id : undefined;
    }
    default:
      return undefined;
  }
};

/** Seed 2–4 demo rows per entity, parents first (entities are in topo order). */
export const seedDemoRows = (meta: PreviewSpecMeta): Record<string, PreviewRecord[]> => {
  const records: Record<string, PreviewRecord[]> = {};
  for (const entity of meta.entities) {
    const count = entity.isWorkflow ? 4 : 3;
    const rows: PreviewRecord[] = [];
    for (let i = 0; i < count; i++) {
      const now = new Date().toISOString();
      const row: PreviewRecord = { id: uuidv4(), createdAt: now, updatedAt: now };
      for (const f of entity.fields) {
        if (f.isStatus) continue;
        const val = fakeValue(f, i, records);
        if (val !== undefined) row[f.attrName] = val;
      }
      if (entity.isWorkflow && meta.workflow) {
        // Advance the first row one step so the board isn't all in the initial state.
        const first = meta.workflow.transitions.find((t) => t.from === meta.workflow!.initialStateKey);
        row.status = i === 0 && first ? first.to : meta.workflow.initialStateKey;
      }
      rows.push(row);
    }
    records[entity.key] = rows;
  }
  return records;
};

// ── Persistence + service methods (all return the full PreviewState) ──

const toState = (meta: PreviewSpecMeta, sandbox: { records: any; activeRoleKey: string }): PreviewState => ({
  meta,
  records: (sandbox.records || {}) as Record<string, PreviewRecord[]>,
  activeRoleKey: sandbox.activeRoleKey,
});

const persist = (projectId: string, userId: string, records: Record<string, PreviewRecord[]>, activeRoleKey: string) =>
  PreviewSandbox.findOneAndUpdate(
    { projectId, userId },
    { $set: { records, activeRoleKey } },
    { new: true }
  );

/** Ensure a seeded sandbox exists; returns { meta, sandbox }. */
const ensure = async (userId: string, projectId: string) => {
  const { ir, spec, project } = await getIR(userId, projectId);
  const meta = buildMeta(ir, project.name);
  // Swap the default brand palette for the project's saved theme (Phase 7).
  meta.theme = await getPreviewTheme(userId, projectId, ir.domain);
  let sandbox = await PreviewSandbox.findOne({ projectId, userId });
  if (!sandbox) {
    sandbox = await PreviewSandbox.create({
      projectId,
      userId,
      domain: ir.domain,
      specVersion: spec.version,
      activeRoleKey: ir.roleKeys[0] ?? '',
      records: {},
      seeded: false,
    });
  }
  if (!sandbox.seeded) {
    sandbox = await PreviewSandbox.findOneAndUpdate(
      { projectId, userId },
      {
        $set: {
          records: seedDemoRows(meta),
          seeded: true,
          specVersion: spec.version,
          activeRoleKey: sandbox.activeRoleKey || ir.roleKeys[0] || '',
        },
      },
      { new: true }
    );
  }
  return { meta, sandbox: sandbox! };
};

/** Idempotent: create + seed the sandbox if needed, then return state. */
export const initSandboxService = async (userId: string, projectId: string): Promise<PreviewState> => {
  const { meta, sandbox } = await ensure(userId, projectId);
  return toState(meta, sandbox);
};

export const getStateService = async (userId: string, projectId: string): Promise<PreviewState> => {
  const { meta, sandbox } = await ensure(userId, projectId);
  return toState(meta, sandbox);
};

export const setRoleService = async (userId: string, projectId: string, roleKey: string): Promise<PreviewState> => {
  const { meta, sandbox } = await ensure(userId, projectId);
  if (!meta.roles.some((r) => r.key === roleKey)) {
    throw new AppError('Unknown role.', 400, 'VALIDATION_ERROR');
  }
  const updated = await persist(projectId, userId, sandbox.records || {}, roleKey);
  return toState(meta, updated!);
};

const entityOrThrow = (meta: PreviewSpecMeta, entityKey: string): PreviewEntityMeta => {
  const entity = meta.entities.find((e) => e.key === entityKey);
  if (!entity) throw new AppError('Unknown collection.', 404, 'ENTITY_NOT_FOUND');
  return entity;
};

export const createRecordService = async (
  userId: string,
  projectId: string,
  entityKey: string,
  input: Record<string, any>
): Promise<PreviewState> => {
  const { meta, sandbox } = await ensure(userId, projectId);
  const entity = entityOrThrow(meta, entityKey);
  const records = { ...(sandbox.records || {}) };
  const data = validateRecord(entity, input, records);
  const now = new Date().toISOString();
  const record: PreviewRecord = { id: uuidv4(), ...data, createdAt: now, updatedAt: now };
  if (entity.isWorkflow && meta.workflow) record.status = meta.workflow.initialStateKey;
  records[entityKey] = [...(records[entityKey] || []), record];
  const updated = await persist(projectId, userId, records, sandbox.activeRoleKey);
  return toState(meta, updated!);
};

export const updateRecordService = async (
  userId: string,
  projectId: string,
  entityKey: string,
  recordId: string,
  input: Record<string, any>
): Promise<PreviewState> => {
  const { meta, sandbox } = await ensure(userId, projectId);
  const entity = entityOrThrow(meta, entityKey);
  const records = { ...(sandbox.records || {}) };
  const list = records[entityKey] || [];
  const idx = list.findIndex((r) => r.id === recordId);
  if (idx === -1) throw new AppError(`${entity.label} record not found.`, 404, 'RECORD_NOT_FOUND');
  const data = validateRecord(entity, input, records);
  const existing = list[idx];
  list[idx] = { ...existing, ...data, id: existing.id, status: existing.status, createdAt: existing.createdAt, updatedAt: new Date().toISOString() };
  records[entityKey] = [...list];
  const updated = await persist(projectId, userId, records, sandbox.activeRoleKey);
  return toState(meta, updated!);
};

export const deleteRecordService = async (
  userId: string,
  projectId: string,
  entityKey: string,
  recordId: string
): Promise<PreviewState> => {
  const { meta, sandbox } = await ensure(userId, projectId);
  entityOrThrow(meta, entityKey);
  const records = { ...(sandbox.records || {}) };
  records[entityKey] = (records[entityKey] || []).filter((r) => r.id !== recordId);
  const updated = await persist(projectId, userId, records, sandbox.activeRoleKey);
  return toState(meta, updated!);
};

export const transitionRecordService = async (
  userId: string,
  projectId: string,
  entityKey: string,
  recordId: string,
  to: string
): Promise<PreviewState> => {
  const { meta, sandbox } = await ensure(userId, projectId);
  const entity = entityOrThrow(meta, entityKey);
  if (!entity.isWorkflow || !meta.workflow) {
    throw new AppError('This collection has no workflow.', 400, 'NOT_A_WORKFLOW');
  }
  const records = { ...(sandbox.records || {}) };
  const list = records[entityKey] || [];
  const idx = list.findIndex((r) => r.id === recordId);
  if (idx === -1) throw new AppError(`${entity.label} record not found.`, 404, 'RECORD_NOT_FOUND');
  const record = applyTransition(meta.workflow, { ...list[idx] }, to, sandbox.activeRoleKey);
  list[idx] = record;
  records[entityKey] = [...list];
  const updated = await persist(projectId, userId, records, sandbox.activeRoleKey);
  return toState(meta, updated!);
};

export const resetSandboxService = async (userId: string, projectId: string): Promise<PreviewState> => {
  const { meta, sandbox } = await ensure(userId, projectId);
  const updated = await persist(projectId, userId, seedDemoRows(meta), sandbox.activeRoleKey);
  return toState(meta, updated!);
};
