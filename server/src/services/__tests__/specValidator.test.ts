import { validateSpec } from '../spec/specValidator';
import { WorkflowSpecData } from '../../types/spec.types';

/** A minimal spec that passes every check — each test breaks exactly one thing. */
const validSpec = (): WorkflowSpecData => ({
  domain: 'clinic',
  entities: [
    {
      key: 'patient', name: 'Patient', label: 'Patient Records',
      fields: [{ name: 'Full Name', type: 'text', required: true }],
    },
    {
      key: 'appointment', name: 'Appointment', label: 'Appointment Book',
      isWorkflowEntity: true,
      fields: [
        { name: 'Patient', type: 'reference', reference: 'patient' },
        { name: 'Status', type: 'enum', options: ['Booked', 'Seen'] },
      ],
    },
    // A payments collection so the "no payments tracked" risk stays quiet here.
    {
      key: 'payment', name: 'Payment', label: 'Payments',
      fields: [{ name: 'Amount', type: 'currency' }],
    },
  ],
  roles: [
    { key: 'doctor', name: 'Doctor', permissions: [{ action: 'View Records', allowed: true }] },
    { key: 'reception', name: 'Receptionist', permissions: [{ action: 'View Records', allowed: true }] },
  ],
  states: [
    { key: 'booked', label: 'Booked', order: 1, isInitial: true },
    { key: 'seen', label: 'Seen', order: 2, isFinal: true },
  ],
  transitions: [{ from: 'booked', to: 'seen', label: 'Mark Seen', role: 'doctor' }],
  businessRules: [{ text: 'A doctor must see the patient before closing.' }],
  notificationTriggers: [{ event: 'Appointment booked', channel: 'email', description: 'Confirm to patient.' }],
  suggestions: [],
  risks: [],
  explanations: [],
  checklist: [],
  completionScore: 0,
});

const errorsOf = (mutate: (s: WorkflowSpecData) => void) => {
  const spec = validSpec();
  mutate(spec);
  return validateSpec(spec).validationErrors;
};

describe('validateSpec — a well-formed spec', () => {
  it('produces no validation errors', () => {
    expect(validateSpec(validSpec()).validationErrors).toEqual([]);
  });

  it('scores 100% when every checklist item is satisfied', () => {
    const result = validateSpec(validSpec());
    expect(result.checklist).toHaveLength(5);
    expect(result.completionScore).toBe(100);
  });
});

describe('validateSpec — broken references (FE5.3)', () => {
  it('flags a reference field pointing at a missing collection', () => {
    const errors = errorsOf((s) => { s.entities[1].fields[0].reference = 'ghost'; });
    expect(errors.join(' ')).toMatch(/references a missing collection "ghost"/);
  });

  it('flags a transition pointing at a missing stage', () => {
    const errors = errorsOf((s) => { s.transitions[0].to = 'ghost'; });
    expect(errors.join(' ')).toMatch(/missing workflow stage/);
  });

  it('flags a transition assigned to a missing role', () => {
    const errors = errorsOf((s) => { s.transitions[0].role = 'ghost'; });
    expect(errors.join(' ')).toMatch(/missing role "ghost"/);
  });
});

describe('validateSpec — structural integrity (FE5.3)', () => {
  it('flags duplicate entity keys', () => {
    const errors = errorsOf((s) => { s.entities[1].key = 'patient'; });
    expect(errors.join(' ')).toMatch(/Duplicate data collection "patient"/);
  });

  it('flags duplicate role keys', () => {
    const errors = errorsOf((s) => { s.roles[1].key = 'doctor'; });
    expect(errors.join(' ')).toMatch(/Duplicate role "doctor"/);
  });

  it('flags a spec with no workflow collection', () => {
    const errors = errorsOf((s) => { s.entities[1].isWorkflowEntity = false; });
    expect(errors.join(' ')).toMatch(/no data collection is marked as the workflow collection/i);
  });

  it('flags zero starting stages', () => {
    const errors = errorsOf((s) => { s.states[0].isInitial = false; });
    expect(errors.join(' ')).toMatch(/must be marked as the starting stage/);
  });

  it('flags more than one starting stage', () => {
    const errors = errorsOf((s) => { s.states[1].isInitial = true; });
    expect(errors.join(' ')).toMatch(/Only one workflow stage can be the starting stage/);
  });

  it('flags a choice field with fewer than two options', () => {
    const errors = errorsOf((s) => { s.entities[1].fields[1].options = ['Booked']; });
    expect(errors.join(' ')).toMatch(/needs at least two options/);
  });

  it('flags a business rule with empty text', () => {
    const errors = errorsOf((s) => { s.businessRules.push({ text: '   ' }); });
    expect(errors.join(' ')).toMatch(/Every business rule needs text/);
  });
});

describe('validateSpec — soft risks (FE5.8)', () => {
  it('raises a risk when no stage is marked as an end stage', () => {
    const spec = validSpec();
    spec.states[1].isFinal = false;
    const { risks, validationErrors } = validateSpec(spec);
    expect(risks.map((r) => r.id)).toContain('risk-no-final-state');
    expect(validationErrors).toEqual([]); // soft — must NOT block approval
  });

  it('raises a risk when the workflow collection has no Status field', () => {
    const spec = validSpec();
    spec.entities[1].fields = spec.entities[1].fields.filter((f) => f.name !== 'Status');
    expect(validateSpec(spec).risks.map((r) => r.id)).toContain('risk-status-appointment');
  });
});

import { sanitizeSuggestionEffects } from '../spec/geminiSpecProvider';

describe('sanitizeSuggestionEffects — never trust the model (FE5.9)', () => {
  const withSuggestions = (suggestions: any[]): WorkflowSpecData => ({
    ...validSpec(),
    suggestions,
  });

  it('keeps an effect that targets a real entity', () => {
    const spec = sanitizeSuggestionEffects(withSuggestions([
      {
        id: 's1', title: 'Add follow-up', description: '…', applied: false,
        effect: { kind: 'addField', entityKey: 'patient', field: { name: 'Follow-up', type: 'date' } },
      },
    ]));
    expect(spec.suggestions[0].effect).toBeDefined();
  });

  it('drops an effect targeting a missing entity, leaving advice-only', () => {
    const spec = sanitizeSuggestionEffects(withSuggestions([
      {
        id: 's1', title: 'Bad', description: '…', applied: false,
        effect: { kind: 'addField', entityKey: 'ghost', field: { name: 'X', type: 'text' } },
      },
    ]));
    expect(spec.suggestions[0].effect).toBeUndefined();
    expect(spec.suggestions[0].title).toBe('Bad'); // the suggestion itself survives
  });

  it('drops an addEnumOption whose field does not exist', () => {
    const spec = sanitizeSuggestionEffects(withSuggestions([
      {
        id: 's1', title: 'Bad enum', description: '…', applied: false,
        effect: { kind: 'addEnumOption', entityKey: 'patient', fieldName: 'ghost', option: 'X' },
      },
    ]));
    expect(spec.suggestions[0].effect).toBeUndefined();
  });

  it('drops an unknown effect kind and an effect with a bad field type', () => {
    const spec = sanitizeSuggestionEffects(withSuggestions([
      { id: 'a', title: 'A', description: '…', applied: false, effect: { kind: 'launchRocket' } },
      {
        id: 'b', title: 'B', description: '…', applied: false,
        effect: { kind: 'addField', entityKey: 'patient', field: { name: 'X', type: 'nonsense' } },
      },
    ]));
    expect(spec.suggestions[0].effect).toBeUndefined();
    expect(spec.suggestions[1].effect).toBeUndefined();
  });
});
