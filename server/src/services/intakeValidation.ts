/**
 * Deterministic intake intelligence (Module 2, FE2.6–2.9 detection + FE2.11 validation).
 *
 * Two responsibilities, both rule-based (reliable, offline, demo-safe):
 *   1. detectItemsForScreen — server-side entity extraction from a guided-screen's
 *      prose so `detectedItems` are authoritative (not client-supplied).
 *   2. validateIntakeBundle — pre-extraction consistency check that populates
 *      blocking `errors` and soft `warnings` before a project reaches SPEC_READY.
 */

type Domain = 'clinic' | 'school';

// ── Domain dictionaries ───────────────────────────────────────────

const ROLE_WORDS: Record<Domain, string[]> = {
  clinic: [
    'receptionist', 'doctor', 'physician', 'nurse', 'billing', 'cashier',
    'accountant', 'manager', 'admin', 'administrator', 'lab technician',
    'lab tech', 'pharmacist', 'front desk',
  ],
  school: [
    'principal', 'headmaster', 'class teacher', 'subject teacher', 'teacher',
    'admission officer', 'admissions', 'finance', 'accountant', 'cashier',
    'librarian', 'coordinator', 'admin', 'administrator', 'registrar',
    'parent', 'student',
  ],
};

// Fields that commonly appear in each domain's records (Screen 3).
const FIELD_WORDS: string[] = [
  'name', 'phone', 'contact', 'email', 'address', 'cnic', 'id', 'age', 'dob',
  'date of birth', 'date', 'time', 'gender', 'fee', 'payment', 'amount', 'balance',
  'invoice', 'receipt', 'diagnosis', 'prescription', 'medicine', 'allergy',
  'history', 'lab result', 'result', 'grade', 'marks', 'attendance', 'class',
  'section', 'roll number', 'status', 'appointment', 'follow-up', 'follow up',
];

// Signal words that mark a sentence as a business rule / exception (Screen 4).
const RULE_SIGNALS = [
  'must', 'should', 'only', 'cannot', "can't", 'require', 'required', 'approval',
  'approve', 'approved', 'if ', 'when ', 'threshold', 'limit', 'deadline',
  'overdue', 'late', 'block', 'not allowed', 'mandatory', 'exceed', 'minimum',
  'maximum', 'at least', 'no more than',
];

const APPROVER_ROLES = ['manager', 'admin', 'administrator', 'principal', 'headmaster', 'finance', 'owner', 'director'];
const BILLING_ROLES = ['billing', 'cashier', 'accountant', 'finance'];

// ── Detection ─────────────────────────────────────────────────────

const uniqCI = (arr: string[]): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of arr) {
    const key = item.toLowerCase().trim();
    if (key && !seen.has(key)) { seen.add(key); out.push(item.trim()); }
  }
  return out;
};

const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

/** Extract likely entities from one guided screen's text (deterministic). */
export const detectItemsForScreen = (
  screenNumber: number,
  content: string,
  domain: Domain
): string[] => {
  const text = (content || '').toLowerCase();
  if (!text.trim()) return [];

  if (screenNumber === 2) {
    const found = ROLE_WORDS[domain].filter((role) => text.includes(role));
    return uniqCI(found.map(titleCase)).slice(0, 15);
  }

  if (screenNumber === 3) {
    const found = FIELD_WORDS.filter((f) => text.includes(f));
    return uniqCI(found.map(titleCase)).slice(0, 20);
  }

  if (screenNumber === 4) {
    // Split into sentences and keep those that read like a rule/exception.
    const sentences = (content || '')
      .split(/(?<=[.!?])\s+|\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const rules = sentences.filter((s) =>
      RULE_SIGNALS.some((sig) => s.toLowerCase().includes(sig))
    );
    return uniqCI(rules.map((r) => r.slice(0, 140))).slice(0, 12);
  }

  // Screen 1 (Story) — no structured entities.
  return [];
};

// ── Consistency validation (FE2.11) ───────────────────────────────

export interface IntakeValidationResult {
  errors: string[];   // block assembly / SPEC_READY
  warnings: string[]; // allow, but surface to the user
}

const SCREEN_TITLES = ['Workflow Story', 'People & Roles', 'Data & Tracking', 'Rules & Exceptions'];
const MIN_SCREEN_CHARS = 30;

/** Non-empty answer? handles arrays, strings, yes_no_detail objects. */
const answered = (v: any): boolean => {
  if (v == null) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.values(v).some(answered);
  return String(v).trim().length > 0;
};

const asArray = (v: any): string[] =>
  Array.isArray(v) ? v.map((x) => String(x)) : v == null ? [] : [String(v)];

export const validateIntakeBundle = (bundle: any): IntakeValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const domain: Domain = bundle?.domain === 'school' ? 'school' : 'clinic';
  const form: Record<string, any> = bundle?.structuredFormData || {};
  const screens: any[] = Array.isArray(bundle?.guidedScreens) ? bundle.guidedScreens : [];

  // ERROR: close-ended form incomplete.
  if (!bundle?.structuredFormComplete) {
    errors.push('The close-ended form is incomplete — please answer all required questions.');
  }

  // ERROR: each guided screen needs real content.
  for (let n = 1; n <= 4; n++) {
    const s = screens.find((x) => Number(x.screen) === n);
    const content = (s?.content || '').trim();
    if (content.length < MIN_SCREEN_CHARS) {
      errors.push(`"${SCREEN_TITLES[n - 1]}" needs more detail (at least ${MIN_SCREEN_CHARS} characters).`);
    }
  }

  // Gather roles from the form + screen-2 detection/confirmation.
  const roleKey = domain === 'school' ? 'school_roles' : 'staff_roles';
  const formRoles = asArray(form[roleKey]).map((r) => r.toLowerCase());
  const screen2 = screens.find((x) => Number(x.screen) === 2);
  const screenRoles = ([...(screen2?.confirmedItems || []), ...(screen2?.detectedItems || [])] as string[])
    .map((r) => r.toLowerCase());
  const allRoles = [...formRoles, ...screenRoles];

  // ERROR: no roles anywhere.
  if (allRoles.length === 0) {
    errors.push('No roles or people were identified — describe who is involved in the workflow.');
  }

  const hasRole = (needles: string[]) =>
    allRoles.some((r) => needles.some((n) => r.includes(n)));

  // WARNING: payments captured but no billing/finance role.
  const paymentKey = domain === 'school' ? 'fee_collection_method' : 'payment_methods';
  if (answered(form[paymentKey]) && !hasRole(BILLING_ROLES)) {
    warnings.push('You captured payment methods but no billing/finance role — consider adding a cashier/accountant.');
  }

  // WARNING: approvals required but no approver role.
  const approvals = asArray(form[`${domain}_approvals`]).filter((a) => a && !/^none/i.test(a));
  if (approvals.length > 0 && !hasRole(APPROVER_ROLES)) {
    warnings.push('Approvals are required but no approver role (e.g. manager/admin/principal) was identified.');
  }

  // WARNING: notification channels chosen but no rules/events described.
  const notifKey = domain === 'school' ? 'parent_communication' : 'notification_channels';
  const screen4 = screens.find((x) => Number(x.screen) === 4);
  const screen4Items = [...(screen4?.confirmedItems || []), ...(screen4?.detectedItems || [])];
  if (answered(form[notifKey]) && screen4Items.length === 0) {
    warnings.push('You selected notification channels but described no events/rules that would trigger them.');
  }

  // WARNING: integrations requested (informational).
  const integrations = asArray(form[`${domain}_integrations`]).filter((a) => a && !/^none/i.test(a));
  if (integrations.length > 0) {
    warnings.push(`External integrations requested (${integrations.join(', ')}) — these are captured for the spec but not auto-provisioned.`);
  }

  return { errors, warnings };
};
