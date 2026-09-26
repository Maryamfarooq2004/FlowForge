// Mock the Mongoose models (no live DB; repo convention).
jest.mock('../../models/WorkflowSpec.model', () => ({
  WorkflowSpec: { findOne: jest.fn(), findOneAndUpdate: jest.fn() },
}));
jest.mock('../../models/Project.model', () => ({
  Project: { findOne: jest.fn(), findByIdAndUpdate: jest.fn() },
}));
jest.mock('../../models/IntakeBundle.model', () => ({
  IntakeBundle: { findOne: jest.fn() },
}));
jest.mock('../notification.service', () => ({ notifyProjectOwner: jest.fn() }));

import {
  applyEffect,
  revertEffect,
  resolveRiskService,
  confirmChecklistService,
  approveSpecService,
} from '../workflowspec.service';
import { WorkflowSpecData } from '../../types/spec.types';
import { WorkflowSpec } from '../../models/WorkflowSpec.model';
import { Project } from '../../models/Project.model';

const specFindOne = WorkflowSpec.findOne as jest.Mock;
const specUpdate = WorkflowSpec.findOneAndUpdate as jest.Mock;
const projectUpdate = Project.findByIdAndUpdate as jest.Mock;

const specData = (): WorkflowSpecData => ({
  domain: 'clinic',
  entities: [
    {
      key: 'appointment', name: 'Appointment', label: 'Appointment Book',
      isWorkflowEntity: true,
      fields: [{ name: 'Status', type: 'enum', options: ['Booked', 'Seen', 'Cancelled'] }],
    },
  ],
  roles: [], states: [], transitions: [],
  businessRules: [{ text: 'Existing rule.' }],
  notificationTriggers: [],
  suggestions: [], risks: [], explanations: [], checklist: [], completionScore: 0,
});

describe('applyEffect / revertEffect (FE5.9)', () => {
  it('addField appends the field and revert removes it', () => {
    const data = specData();
    const effect = {
      kind: 'addField' as const,
      entityKey: 'appointment',
      field: { name: 'Follow-up Date', type: 'date' as const },
    };
    applyEffect(data, effect);
    expect(data.entities[0].fields.map((f) => f.name)).toContain('Follow-up Date');
    revertEffect(data, effect);
    expect(data.entities[0].fields.map((f) => f.name)).not.toContain('Follow-up Date');
  });

  it('addField is idempotent (never duplicates an existing name)', () => {
    const data = specData();
    const effect = {
      kind: 'addField' as const,
      entityKey: 'appointment',
      field: { name: 'status', type: 'text' as const },
    };
    applyEffect(data, effect);
    applyEffect(data, effect);
    expect(data.entities[0].fields).toHaveLength(1); // matched 'Status' case-insensitively
  });

  it('ignores an effect targeting a missing entity instead of throwing', () => {
    const data = specData();
    expect(() =>
      applyEffect(data, {
        kind: 'addField',
        entityKey: 'ghost',
        field: { name: 'X', type: 'text' },
      })
    ).not.toThrow();
    expect(data.entities[0].fields).toHaveLength(1);
  });

  it('addEnumOption inserts before the last option and revert removes it', () => {
    const data = specData();
    const effect = {
      kind: 'addEnumOption' as const,
      entityKey: 'appointment',
      fieldName: 'Status',
      option: 'Waitlisted',
    };
    applyEffect(data, effect);
    expect(data.entities[0].fields[0].options).toEqual(['Booked', 'Seen', 'Waitlisted', 'Cancelled']);
    revertEffect(data, effect);
    expect(data.entities[0].fields[0].options).toEqual(['Booked', 'Seen', 'Cancelled']);
  });

  it('addRule appends and revert removes, matching case-insensitively', () => {
    const data = specData();
    const effect = { kind: 'addRule' as const, rule: { text: 'Collect payment up front.' } };
    applyEffect(data, effect);
    expect(data.businessRules).toHaveLength(2);
    revertEffect(data, effect);
    expect(data.businessRules).toHaveLength(1);
  });

  it('addNotification appends and revert removes', () => {
    const data = specData();
    const effect = {
      kind: 'addNotification' as const,
      trigger: { event: 'Follow-up due', channel: 'email' as const, description: 'Remind staff.' },
    };
    applyEffect(data, effect);
    expect(data.notificationTriggers).toHaveLength(1);
    revertEffect(data, effect);
    expect(data.notificationTriggers).toHaveLength(0);
  });
});

/** A persisted spec doc: plain data + the toObject() Mongoose docs expose. */
const specDoc = (overrides: Record<string, any> = {}) => {
  const base = {
    ...specData(),
    // a workflow-complete spec so validateSpec yields all 5 checklist items confirmed
    roles: [
      { key: 'doctor', name: 'Doctor', permissions: [] },
      { key: 'reception', name: 'Receptionist', permissions: [] },
    ],
    states: [
      { key: 'booked', label: 'Booked', order: 1, isInitial: true },
      { key: 'seen', label: 'Seen', order: 2, isFinal: true },
    ],
    transitions: [{ from: 'booked', to: 'seen', label: 'Mark Seen' }],
    notificationTriggers: [{ event: 'Booked', channel: 'email', description: 'Confirm.' }],
    resolvedRiskIds: [],
    confirmedChecklistKeys: [],
    ...overrides,
  };
  return { ...base, toObject: () => base };
};

beforeEach(() => {
  jest.clearAllMocks();
  specUpdate.mockImplementation((_q: any, update: any) => Promise.resolve(update.$set));
  projectUpdate.mockResolvedValue({});
});

describe('user review state survives re-validation (FE5.8, FE5.10)', () => {
  it('re-applies resolved risk ids onto freshly computed risks', async () => {
    specFindOne.mockResolvedValue(specDoc());
    const saved: any = await resolveRiskService('u1', 'p1', 'risk-no-payments', true);
    const risk = saved.risks.find((r: any) => r.id === 'risk-no-payments');
    expect(risk.resolved).toBe(true);
    expect(saved.resolvedRiskIds).toContain('risk-no-payments');
  });

  it('re-applies confirmed checklist keys onto the freshly computed checklist', async () => {
    specFindOne.mockResolvedValue(specDoc());
    const saved: any = await confirmChecklistService('u1', 'p1', 'roles', true);
    expect(saved.checklist.find((c: any) => c.key === 'roles').userConfirmed).toBe(true);
    expect(saved.confirmedChecklistKeys).toEqual(['roles']);
  });

  it('un-confirming removes the key', async () => {
    specFindOne.mockResolvedValue(specDoc({ confirmedChecklistKeys: ['roles', 'alerts'] }));
    const saved: any = await confirmChecklistService('u1', 'p1', 'roles', false);
    expect(saved.confirmedChecklistKeys).toEqual(['alerts']);
  });
});

describe('approve gate (FE5.10)', () => {
  it('refuses to approve while checklist items are unconfirmed', async () => {
    specFindOne.mockResolvedValue(specDoc({ confirmedChecklistKeys: ['records'] }));
    await expect(approveSpecService('u1', 'p1')).rejects.toMatchObject({
      statusCode: 400,
      code: 'CHECKLIST_INCOMPLETE',
    });
    expect(specUpdate).not.toHaveBeenCalled();
  });

  it('approves once every checklist item is confirmed', async () => {
    const keys = ['records', 'workflow', 'roles', 'alerts', 'suggestions'];
    specFindOne.mockResolvedValue(specDoc({ confirmedChecklistKeys: keys }));
    specUpdate.mockResolvedValue({ status: 'approved' });
    const approved: any = await approveSpecService('u1', 'p1');
    expect(approved.status).toBe('approved');
    expect(projectUpdate).toHaveBeenCalled();
  });
});
