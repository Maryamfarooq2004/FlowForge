import {
  SpecDomain,
  SpecEntity,
  SpecRole,
  SpecState,
  SpecTransition,
  SpecRule,
  SpecNotificationTrigger,
  SpecSuggestion,
} from '../types/spec.types';

/**
 * Versioned domain knowledge for the two supported domains (clinic, school).
 * The DeterministicSpecProvider starts from one of these templates and enriches
 * it with the user's guided-screen answers. A later GeminiSpecProvider can use
 * these same shapes as few-shot examples.
 */
export interface DomainTemplate {
  entities: SpecEntity[];
  roles: SpecRole[];
  states: SpecState[];
  transitions: SpecTransition[];
  businessRules: SpecRule[];
  notificationTriggers: SpecNotificationTrigger[];
  candidateSuggestions: Array<Omit<SpecSuggestion, 'applied'>>;
}

// ── CLINIC ─────────────────────────────────────────────────────────

const CLINIC_TEMPLATE: DomainTemplate = {
  entities: [
    {
      key: 'patient',
      name: 'Patient',
      label: 'Patient Records',
      description: 'People who receive care at the clinic.',
      fields: [
        { name: 'Full Name', type: 'text', required: true },
        { name: 'Phone Number', type: 'phone', required: true },
        { name: 'Age', type: 'number' },
        { name: 'Gender', type: 'enum', options: ['Male', 'Female', 'Other'] },
        { name: 'Medical History', type: 'richtext' },
        { name: 'Address', type: 'text' },
      ],
    },
    {
      key: 'appointment',
      name: 'Appointment',
      label: 'Appointment Book',
      description: 'Scheduled visits that move through the clinic workflow.',
      isWorkflowEntity: true,
      fields: [
        { name: 'Patient', type: 'reference', reference: 'patient', required: true },
        { name: 'Date', type: 'date', required: true },
        { name: 'Time', type: 'time', required: true },
        { name: 'Type', type: 'enum', options: ['Consultation', 'Follow-up', 'Procedure'] },
        { name: 'Status', type: 'enum', options: ['Booked', 'Confirmed', 'Visited', 'Completed', 'Cancelled'] },
        { name: 'Notes', type: 'text' },
      ],
    },
    {
      key: 'consultation',
      name: 'Consultation',
      label: 'Consultations',
      description: 'The clinical record captured during a visit.',
      fields: [
        { name: 'Appointment', type: 'reference', reference: 'appointment', required: true },
        { name: 'Symptoms', type: 'richtext' },
        { name: 'Diagnosis', type: 'richtext' },
        { name: 'Prescription', type: 'richtext' },
      ],
    },
    {
      key: 'payment',
      name: 'Payment',
      label: 'Payment Records',
      description: 'Fees collected for visits and procedures.',
      fields: [
        { name: 'Patient', type: 'reference', reference: 'patient', required: true },
        { name: 'Amount', type: 'currency', required: true },
        { name: 'Method', type: 'enum', options: ['Cash', 'Card', 'Insurance'] },
        { name: 'Status', type: 'enum', options: ['Pending', 'Paid', 'Waived'] },
        { name: 'Date', type: 'date' },
      ],
    },
  ],
  roles: [
    {
      key: 'receptionist',
      name: 'Receptionist',
      description: 'Handles patient intake, scheduling, and basic record maintenance.',
      permissions: [
        { action: 'Register Patients', allowed: true },
        { action: 'Book Appointments', allowed: true },
        { action: 'View Patient Records', allowed: true },
        { action: 'Manage Payments', allowed: true },
        { action: 'Edit Diagnosis', allowed: false },
        { action: 'View Reports', allowed: false },
      ],
    },
    {
      key: 'doctor',
      name: 'Doctor',
      description: 'Full clinical access to patient records and medical histories.',
      permissions: [
        { action: 'View Patient Records', allowed: true },
        { action: 'Edit Diagnosis', allowed: true },
        { action: 'Write Prescriptions', allowed: true },
        { action: 'Book Appointments', allowed: false },
        { action: 'Manage Payments', allowed: false },
        { action: 'View Reports', allowed: true },
      ],
    },
    {
      key: 'manager',
      name: 'Manager',
      description: 'Oversees clinic operations, staff, and finances.',
      permissions: [
        { action: 'View Patient Records', allowed: true },
        { action: 'Manage Payments', allowed: true },
        { action: 'Manage Staff', allowed: true },
        { action: 'View Reports', allowed: true },
        { action: 'Edit Diagnosis', allowed: false },
      ],
    },
  ],
  states: [
    { key: 'booked', label: 'Appointment Booked', order: 1, isInitial: true },
    { key: 'confirmed', label: 'Appointment Confirmed', order: 2 },
    { key: 'visited', label: 'Patient Visited', order: 3 },
    { key: 'followup', label: 'Follow-up Needed', order: 4 },
    { key: 'completed', label: 'Visit Completed', order: 5, isFinal: true },
    { key: 'cancelled', label: 'Cancelled', order: 6, isFinal: true },
  ],
  transitions: [
    { from: 'booked', to: 'confirmed', label: 'Confirm', role: 'receptionist' },
    { from: 'confirmed', to: 'visited', label: 'Check In', role: 'receptionist' },
    { from: 'visited', to: 'completed', label: 'Complete Visit', role: 'doctor' },
    { from: 'visited', to: 'followup', label: 'Needs Follow-up', role: 'doctor' },
    { from: 'followup', to: 'completed', label: 'Resolve', role: 'doctor' },
    { from: 'booked', to: 'cancelled', label: 'Cancel', role: 'receptionist' },
  ],
  businessRules: [
    { text: 'Appointments must be cancelled at least 24 hours in advance to avoid a no-show fee.', category: 'scheduling' },
    { text: 'Only Doctors can view or edit clinical diagnoses.', category: 'access' },
    { text: 'A patient with an unpaid balance cannot book a new appointment.', category: 'billing' },
    { text: 'A payment receipt is generated automatically when a payment is marked Paid.', category: 'billing' },
  ],
  notificationTriggers: [
    { event: 'Follow-up due', channel: 'both', description: 'Notify staff when a patient follow-up is due.' },
    { event: 'Payment pending', channel: 'email', description: 'Remind patients of a pending balance.' },
    { event: 'Appointment reminder', channel: 'both', description: 'Remind patients of an upcoming appointment.' },
  ],
  candidateSuggestions: [
    {
      id: 'clinic-followup-date',
      title: 'Add a Follow-up Date field',
      description: "Add a follow-up date to the Appointment Book to improve patient retention and never miss a recall.",
      targetEntity: 'appointment',
      effect: { kind: 'addField', entityKey: 'appointment', field: { name: 'Follow-up Date', type: 'date' } },
    },
    {
      id: 'clinic-referring-doctor',
      title: 'Track Referring Doctor',
      description: 'Record a referring doctor on consultations for better clinical reporting.',
      targetEntity: 'consultation',
      effect: { kind: 'addField', entityKey: 'consultation', field: { name: 'Referring Doctor', type: 'text' } },
    },
  ],
};

// ── SCHOOL ─────────────────────────────────────────────────────────

const SCHOOL_TEMPLATE: DomainTemplate = {
  entities: [
    {
      key: 'student',
      name: 'Student',
      label: 'Student Records',
      description: 'Prospective and enrolled students.',
      fields: [
        { name: 'Full Name', type: 'text', required: true },
        { name: 'Date of Birth', type: 'date' },
        { name: 'Guardian Name', type: 'text', required: true },
        { name: 'Guardian Contact', type: 'phone', required: true },
        { name: 'Previous School', type: 'text' },
        { name: 'Grade Applying For', type: 'text' },
      ],
    },
    {
      key: 'application',
      name: 'Application',
      label: 'Applications',
      description: 'Admission applications moving through the workflow.',
      isWorkflowEntity: true,
      fields: [
        { name: 'Student', type: 'reference', reference: 'student', required: true },
        { name: 'Submitted Date', type: 'date', required: true },
        { name: 'Test Score', type: 'number' },
        { name: 'Interview Notes', type: 'richtext' },
        { name: 'Status', type: 'enum', options: ['Submitted', 'Test Scheduled', 'Interviewed', 'Accepted', 'Rejected'] },
      ],
    },
    {
      key: 'enrollment',
      name: 'Enrollment',
      label: 'Enrollments',
      description: 'Accepted students enrolled into a class.',
      fields: [
        { name: 'Student', type: 'reference', reference: 'student', required: true },
        { name: 'Class', type: 'text', required: true },
        { name: 'Enrollment Date', type: 'date' },
        { name: 'Status', type: 'enum', options: ['Active', 'Withdrawn'] },
      ],
    },
    {
      key: 'feeplan',
      name: 'Fee Plan',
      label: 'Fee Plans',
      description: 'The fee schedule assigned to an enrolled student.',
      fields: [
        { name: 'Student', type: 'reference', reference: 'student', required: true },
        { name: 'Total Amount', type: 'currency', required: true },
        { name: 'Installments', type: 'number' },
      ],
    },
    {
      key: 'payment',
      name: 'Payment',
      label: 'Fee Payments',
      description: 'Fee payments collected against a fee plan.',
      fields: [
        { name: 'Student', type: 'reference', reference: 'student', required: true },
        { name: 'Amount', type: 'currency', required: true },
        { name: 'Due Date', type: 'date' },
        { name: 'Status', type: 'enum', options: ['Pending', 'Partial', 'Paid', 'Overdue'] },
      ],
    },
  ],
  roles: [
    {
      key: 'admission_officer',
      name: 'Admission Officer',
      description: 'Processes applications, schedules tests, and records decisions.',
      permissions: [
        { action: 'Register Applications', allowed: true },
        { action: 'Schedule Tests', allowed: true },
        { action: 'Record Decisions', allowed: true },
        { action: 'View Student Records', allowed: true },
        { action: 'Manage Fees', allowed: false },
      ],
    },
    {
      key: 'teacher',
      name: 'Teacher',
      description: 'Conducts assessments and manages enrolled students.',
      permissions: [
        { action: 'View Student Records', allowed: true },
        { action: 'Record Test Scores', allowed: true },
        { action: 'Record Decisions', allowed: false },
        { action: 'Manage Fees', allowed: false },
      ],
    },
    {
      key: 'principal',
      name: 'Principal',
      description: 'Approves admissions and oversees the school.',
      permissions: [
        { action: 'View Student Records', allowed: true },
        { action: 'Approve Admissions', allowed: true },
        { action: 'View Reports', allowed: true },
        { action: 'Manage Fees', allowed: true },
      ],
    },
    {
      key: 'accounts_staff',
      name: 'Accounts Staff',
      description: 'Manages fee plans, collects payments, and issues receipts.',
      permissions: [
        { action: 'Manage Fees', allowed: true },
        { action: 'Collect Payments', allowed: true },
        { action: 'View Student Records', allowed: true },
        { action: 'Approve Admissions', allowed: false },
      ],
    },
  ],
  states: [
    { key: 'submitted', label: 'Application Submitted', order: 1, isInitial: true },
    { key: 'test_scheduled', label: 'Test Scheduled', order: 2 },
    { key: 'interviewed', label: 'Interviewed', order: 3 },
    { key: 'accepted', label: 'Accepted', order: 4, isFinal: true },
    { key: 'rejected', label: 'Rejected', order: 5, isFinal: true },
  ],
  transitions: [
    { from: 'submitted', to: 'test_scheduled', label: 'Schedule Test', role: 'admission_officer' },
    { from: 'test_scheduled', to: 'interviewed', label: 'Record Interview', role: 'admission_officer' },
    { from: 'interviewed', to: 'accepted', label: 'Accept', role: 'principal' },
    { from: 'interviewed', to: 'rejected', label: 'Reject', role: 'principal' },
  ],
  businessRules: [
    { text: 'Admission requires an entry-test score above the configured threshold (e.g. 60%).', category: 'admission' },
    { text: 'Enrollment is blocked until the first fee installment is paid.', category: 'billing' },
    { text: 'Only the Principal can approve or reject an admission.', category: 'access' },
    { text: 'An overdue fee triggers a reminder to the guardian.', category: 'billing' },
  ],
  notificationTriggers: [
    { event: 'Fee deadline', channel: 'both', description: 'Remind guardians before a fee installment is due.' },
    { event: 'Test scheduled', channel: 'email', description: 'Inform guardians when an entry test is scheduled.' },
    { event: 'Admission decision', channel: 'both', description: 'Notify guardians of the admission decision.' },
  ],
  candidateSuggestions: [
    {
      id: 'school-waitlist',
      title: 'Add a Waitlist status',
      description: 'Add a "Waitlisted" application status so strong applicants can be held when seats are full.',
      targetEntity: 'application',
      effect: { kind: 'addEnumOption', entityKey: 'application', fieldName: 'Status', option: 'Waitlisted' },
    },
    {
      id: 'school-sibling',
      title: 'Track Sibling Link',
      description: 'Record whether an applicant has a sibling already enrolled, for priority admissions.',
      targetEntity: 'student',
      effect: { kind: 'addField', entityKey: 'student', field: { name: 'Sibling Enrolled', type: 'boolean' } },
    },
  ],
};

const TEMPLATES: Record<SpecDomain, DomainTemplate> = {
  clinic: CLINIC_TEMPLATE,
  school: SCHOOL_TEMPLATE,
};

/** Deep-clone a template so callers can safely mutate the result. */
export const getDomainTemplate = (domain: SpecDomain): DomainTemplate => {
  const template = TEMPLATES[domain] ?? CLINIC_TEMPLATE;
  return JSON.parse(JSON.stringify(template)) as DomainTemplate;
};
