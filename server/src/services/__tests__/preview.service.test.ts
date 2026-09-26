import { buildContext } from '../../generation/generate';
import { SpecInput } from '../../generation/ir/buildIR';
import { getDomainTemplate } from '../../config/domainTemplates';
import { buildMeta, seedDemoRows, validateRecord, applyTransition } from '../preview.service';
import { PreviewSpecMeta, PreviewEntityMeta } from '../../types/preview.types';
import { PreviewRecord } from '../../models/PreviewSandbox.model';

const specFor = (domain: 'clinic' | 'school'): SpecInput => {
  const t = getDomainTemplate(domain);
  return {
    domain,
    entities: t.entities,
    roles: t.roles,
    states: t.states,
    transitions: t.transitions,
    businessRules: t.businessRules,
  };
};

const metaFor = (domain: 'clinic' | 'school'): PreviewSpecMeta => {
  const ir = buildContext(specFor(domain), `${domain} demo`).ir;
  return buildMeta(ir, `${domain} demo`);
};

// Build a fully-valid create payload for an entity given the current records.
const validInput = (entity: PreviewEntityMeta, records: Record<string, PreviewRecord[]>) => {
  const input: Record<string, any> = {};
  for (const f of entity.fields) {
    if (f.isStatus) continue;
    if (f.fieldType === 'enum') input[f.attrName] = f.enumValues?.[0];
    else if (f.ref) input[f.attrName] = records[f.ref.targetKey]?.[0]?.id;
    else if (f.fieldType === 'number' || f.fieldType === 'currency') input[f.attrName] = 5;
    else if (f.fieldType === 'boolean') input[f.attrName] = true;
    else if (f.fieldType === 'date') input[f.attrName] = '2026-01-01';
    else if (f.fieldType === 'time') input[f.attrName] = '10:00';
    else input[f.attrName] = 'Sample';
  }
  return input;
};

describe.each(['clinic', 'school'] as const)('preview service — %s', (domain) => {
  const meta = metaFor(domain);
  const seeded = seedDemoRows(meta);

  it('seeds parents before children — every reference resolves to an existing row', () => {
    for (const entity of meta.entities) {
      const rows = seeded[entity.key];
      expect(rows.length).toBeGreaterThan(0);
      for (const f of entity.fields) {
        if (!f.ref) continue;
        const targetIds = new Set((seeded[f.ref.targetKey] ?? []).map((r) => r.id));
        for (const row of rows) {
          expect(row[f.attrName]).toBeDefined();
          expect(targetIds.has(row[f.attrName])).toBe(true);
        }
      }
    }
  });

  it('gives the workflow entity a valid initial/next status on every seeded row', () => {
    if (!meta.workflow) return;
    const wf = meta.entities.find((e) => e.isWorkflow)!;
    const stateKeys = new Set(meta.workflow.states.map((s) => s.key));
    for (const row of seeded[wf.key]) expect(stateKeys.has(String(row.status))).toBe(true);
  });

  it('validateRecord rejects a missing required field', () => {
    const entity = meta.entities.find((e) => e.fields.some((f) => f.required && !f.isStatus))!;
    expect(() => validateRecord(entity, {}, seeded)).toThrow(/required/i);
  });

  it('validateRecord rejects an out-of-enum value', () => {
    const entity = meta.entities.find((e) => e.fields.some((f) => f.fieldType === 'enum' && !f.isStatus));
    if (!entity) return;
    const enumField = entity.fields.find((f) => f.fieldType === 'enum' && !f.isStatus)!;
    const input = { ...validInput(entity, seeded), [enumField.attrName]: '__NOT_A_VALID_OPTION__' };
    expect(() => validateRecord(entity, input, seeded)).toThrow(/must be one of/i);
  });

  it('validateRecord rejects a dangling foreign key', () => {
    const entity = meta.entities.find((e) => e.fields.some((f) => !!f.ref));
    if (!entity) return;
    const refField = entity.fields.find((f) => !!f.ref)!;
    const input = { ...validInput(entity, seeded), [refField.attrName]: 'does-not-exist' };
    expect(() => validateRecord(entity, input, seeded)).toThrow(/does not exist/i);
  });

  it('validateRecord accepts a valid payload and never returns the status field', () => {
    const wf = meta.entities.find((e) => e.isWorkflow) ?? meta.entities[0];
    const input = { ...validInput(wf, seeded), status: 'anything' };
    const data = validateRecord(wf, input, seeded);
    expect(data).not.toHaveProperty('status');
    // required fields are present
    for (const f of wf.fields) {
      if (f.required && !f.isStatus) expect(data[f.attrName]).toBeDefined();
    }
  });

  it('applyTransition rejects an unreachable target state', () => {
    if (!meta.workflow) return;
    const rec: PreviewRecord = { id: 'x', status: meta.workflow.initialStateKey, createdAt: '', updatedAt: '' };
    // A final state is never directly reachable from the initial state.
    const unreachable = meta.workflow.states.find((s) => s.isFinal)?.key ?? meta.workflow.states[meta.workflow.states.length - 1].key;
    // Ensure it truly has no direct transition from initial.
    const hasDirect = meta.workflow.transitions.some((t) => t.from === meta.workflow!.initialStateKey && t.to === unreachable);
    if (hasDirect) return;
    expect(() => applyTransition(meta.workflow!, rec, unreachable, 'anyone')).toThrow(/Cannot move/i);
  });

  it('applyTransition enforces the transition role, then succeeds with the right role', () => {
    if (!meta.workflow) return;
    const first = meta.workflow.transitions.find((t) => t.from === meta.workflow!.initialStateKey);
    if (!first) return;
    const base = (): PreviewRecord => ({ id: 'x', status: meta.workflow!.initialStateKey, createdAt: '', updatedAt: '' });

    if (first.roleKey) {
      expect(() => applyTransition(meta.workflow!, base(), first.to, '__wrong_role__')).toThrow(/role can perform/i);
    }
    const actor = first.roleKey ?? 'anyone';
    const moved = applyTransition(meta.workflow!, base(), first.to, actor);
    expect(moved.status).toBe(first.to);
  });
});

describe('preview service — domain-specific transitions', () => {
  it('clinic: booked→confirmed as receptionist', () => {
    const meta = metaFor('clinic');
    const rec: PreviewRecord = { id: 'a', status: 'booked', createdAt: '', updatedAt: '' };
    expect(applyTransition(meta.workflow!, rec, 'confirmed', 'receptionist').status).toBe('confirmed');
  });
  it('clinic: booked→visited is not a valid direct transition', () => {
    const meta = metaFor('clinic');
    const rec: PreviewRecord = { id: 'a', status: 'booked', createdAt: '', updatedAt: '' };
    expect(() => applyTransition(meta.workflow!, rec, 'visited', 'receptionist')).toThrow(/Cannot move/i);
  });
  it('school: submitted→test_scheduled as admission_officer', () => {
    const meta = metaFor('school');
    const rec: PreviewRecord = { id: 'a', status: 'submitted', createdAt: '', updatedAt: '' };
    expect(applyTransition(meta.workflow!, rec, 'test_scheduled', 'admission_officer').status).toBe('test_scheduled');
  });
});
