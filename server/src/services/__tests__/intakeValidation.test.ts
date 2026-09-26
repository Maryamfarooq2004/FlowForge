import { detectItemsForScreen, validateIntakeBundle } from '../intakeValidation';

// A helper to build a bundle-like object.
const bundle = (over: any = {}) => ({
  domain: 'clinic',
  structuredFormComplete: true,
  structuredFormData: {},
  guidedScreens: [
    { screen: 1, content: 'x'.repeat(40), detectedItems: [], confirmedItems: [], isComplete: true },
    { screen: 2, content: 'The receptionist and doctor handle patients; a manager approves refunds.', detectedItems: [], confirmedItems: [], isComplete: true },
    { screen: 3, content: 'We record patient name, phone, diagnosis and fee amount.', detectedItems: [], confirmedItems: [], isComplete: true },
    { screen: 4, content: 'Refunds must be approved by a manager. Fees over 5000 require approval.', detectedItems: [], confirmedItems: [], isComplete: true },
  ],
  ...over,
});

describe('detectItemsForScreen', () => {
  it('detects clinic roles from screen 2 prose', () => {
    const roles = detectItemsForScreen(2, 'The receptionist greets patients, the doctor examines them, and the billing staff collects fees.', 'clinic');
    expect(roles.map((r) => r.toLowerCase())).toEqual(expect.arrayContaining(['receptionist', 'doctor', 'billing']));
  });

  it('detects data fields from screen 3 prose', () => {
    const fields = detectItemsForScreen(3, 'We store the patient name, phone number, diagnosis and the fee.', 'clinic');
    expect(fields.map((f) => f.toLowerCase())).toEqual(expect.arrayContaining(['name', 'phone', 'diagnosis', 'fee']));
  });

  it('detects rule sentences from screen 4 prose', () => {
    const rules = detectItemsForScreen(4, 'Appointments must be booked in advance. The sky is blue. Refunds require approval.', 'clinic');
    expect(rules.length).toBe(2);
    expect(rules.join(' ').toLowerCase()).toContain('must');
  });

  it('returns [] for screen 1 (story) and empty content', () => {
    expect(detectItemsForScreen(1, 'anything here', 'clinic')).toEqual([]);
    expect(detectItemsForScreen(2, '', 'clinic')).toEqual([]);
  });

  it('uses the school role dictionary for school domain', () => {
    const roles = detectItemsForScreen(2, 'The principal and class teacher review each admission; finance collects fees.', 'school');
    expect(roles.map((r) => r.toLowerCase())).toEqual(expect.arrayContaining(['principal', 'finance']));
  });
});

describe('validateIntakeBundle', () => {
  it('passes a complete, consistent clinic bundle (no errors)', () => {
    const { errors } = validateIntakeBundle(bundle({
      structuredFormData: { staff_roles: ['Receptionist', 'Doctor', 'Billing'] },
    }));
    expect(errors).toEqual([]);
  });

  it('errors when the close-ended form is incomplete', () => {
    const { errors } = validateIntakeBundle(bundle({ structuredFormComplete: false }));
    expect(errors.join(' ')).toMatch(/close-ended form is incomplete/i);
  });

  it('errors when a guided screen is too short', () => {
    const b = bundle();
    b.guidedScreens[2].content = 'too short';
    const { errors } = validateIntakeBundle(b);
    expect(errors.join(' ')).toMatch(/Data & Tracking/i);
  });

  it('errors when no roles are identified anywhere', () => {
    const b = bundle({ structuredFormData: {} });
    b.guidedScreens[1].content = 'x'.repeat(40); // no role words
    const { errors } = validateIntakeBundle(b);
    expect(errors.join(' ')).toMatch(/no roles/i);
  });

  it('warns when payments are captured but no billing role exists', () => {
    const b = bundle({ structuredFormData: { payment_methods: ['Cash'], staff_roles: ['Doctor'] } });
    b.guidedScreens[1].content = 'The doctor sees the patient.'; // no billing role
    const { warnings } = validateIntakeBundle(b);
    expect(warnings.join(' ')).toMatch(/billing\/finance role/i);
  });

  it('warns when approvals are required but no approver role exists', () => {
    const b = bundle({ structuredFormData: { staff_roles: ['Receptionist'], clinic_approvals: ['Refunds'] } });
    b.guidedScreens[1].content = 'The receptionist checks in patients.'; // no approver
    const { warnings } = validateIntakeBundle(b);
    expect(warnings.join(' ')).toMatch(/approver role/i);
  });
});
