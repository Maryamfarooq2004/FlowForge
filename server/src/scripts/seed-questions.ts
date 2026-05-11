import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { IntakeQuestion } from '../models/IntakeQuestion.model';

// Fix for Atlas DNS resolution
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const CLINIC_QUESTIONS = [
  // Section 1: Practice Basics (5)
  { id: 'clinic_name', section: 'Practice Basics', question: 'What is the name of your clinic?', type: 'text', placeholder: 'e.g., Al-Shifa Medical Center', required: true },
  { id: 'clinic_type', section: 'Practice Basics', question: 'What type of medical practice do you run?', type: 'select', required: true, options: ['General Practice', 'Pediatric Clinic', 'Gynecology', 'Dental Clinic', 'Eye Clinic', 'Orthopedic', 'Dermatology', 'Multi-Specialty'] },
  { id: 'doctor_count', section: 'Practice Basics', question: 'How many doctors work at your clinic?', type: 'select', required: true, options: ['1 (Solo)', '2–3', '4–6', '7–10', 'More than 10'] },
  { id: 'staff_count', section: 'Practice Basics', question: 'How many support staff members do you have?', type: 'select', required: true, options: ['1–2', '3–5', '6–10', 'More than 10'] },
  { id: 'operating_hours', section: 'Practice Basics', question: 'What are your clinic operating hours?', type: 'select', required: true, options: ['Morning only', 'Evening only', 'Split shift', 'Full day', '24/7'] },

  // Section 2: Patient Flow (6)
  { id: 'daily_patients', section: 'Patient Flow', question: 'Average daily patients?', type: 'select', required: true, options: ['1–15', '16–30', '31–50', '51–80', '80+'] },
  { id: 'appointment_types', section: 'Patient Flow', question: 'Appointment types handled?', type: 'multi_checkbox', required: true, options: ['Walk-ins', 'Pre-booked', 'Emergency', 'Follow-ups', 'Teleconsultation'] },
  { id: 'booking_method', section: 'Patient Flow', question: 'Current booking methods?', type: 'multi_checkbox', required: true, options: ['Phone', 'Walk-in', 'WhatsApp', 'Online', 'Third-party app'] },
  { id: 'avg_consultation_time', section: 'Patient Flow', question: 'Typical consultation length?', type: 'select', required: true, options: ['5–10m', '10–20m', '20–30m', '30–60m', 'Varies'] },
  { id: 'patient_return', section: 'Patient Flow', question: 'Returning patient percentage?', type: 'slider', required: false },
  { id: 'peak_hours', section: 'Patient Flow', question: 'When is your peak patient volume?', type: 'multi_checkbox', options: ['8am-10am', '10am-12pm', '5pm-7pm', '7pm-9pm'] },

  // Section 3: Records & Prescriptions (6)
  { id: 'records_currently', section: 'Patient Records', question: 'Current storage method?', type: 'multi_checkbox', required: true, options: ['Paper files', 'Excel/Sheets', 'Desktop software', 'WhatsApp', 'Memory'] },
  { id: 'record_fields', section: 'Patient Records', question: 'Information tracked per patient?', type: 'multi_checkbox', required: true, options: ['CNIC/ID', 'Contact', 'Age/DOB', 'History', 'Allergies', 'Lab results', 'Scans'] },
  { id: 'prescription_format', section: 'Patient Records', question: 'How are prescriptions written?', type: 'select', required: true, options: ['Handwritten', 'Typed & Printed', 'Verbal', 'WhatsApp/SMS'] },
  { id: 'lab_tests', section: 'Patient Records', question: 'Do you order lab tests?', type: 'yes_no_detail', required: true, yesLabel: 'Yes — external labs', noLabel: 'No — not ordered' },
  { id: 'vaccination_tracking', section: 'Patient Records', question: 'Do you track patient vaccinations?', type: 'yes_no_detail', required: false, yesLabel: 'Yes', noLabel: 'No' },
  { id: 'record_digitization_date', section: 'Patient Records', question: 'Target date to start full digitization?', type: 'date', required: false },

  // Section 4: Billing & Finance (5)
  { id: 'consultation_fee', section: 'Billing', question: 'Consultation fee structure?', type: 'select', required: true, options: ['Fixed', 'By Doctor', 'By Visit Type', 'Waived often'] },
  { id: 'payment_methods', section: 'Billing', question: 'Accepted payment methods?', type: 'multi_checkbox', required: true, options: ['Cash', 'Bank Transfer', 'EasyPaisa/JazzCash', 'Card', 'Insurance'] },
  { id: 'receipt_required', section: 'Billing', question: 'Do you provide receipts?', type: 'select', required: true, options: ['Always Printed', 'Always Digital', 'On request', 'Never'] },
  { id: 'pending_payments', section: 'Billing', question: 'Handling unpaid fees?', type: 'select', required: true, options: ['Block visits', 'Allow credit', 'Not tracked', 'Pre-paid only'] },
  { id: 'discount_priority', section: 'Billing', question: 'How much priority is given to charity/discounts?', type: 'slider', required: false },

  // Section 5: Operations & Staff (5)
  { id: 'staff_roles', section: 'Staff & Access', question: 'Roles needing system access?', type: 'multi_checkbox', required: true, options: ['Receptionist', 'Doctor', 'Nurse', 'Billing', 'Manager', 'Lab Tech'] },
  { id: 'receptionist_access', section: 'Staff & Access', question: 'Receptionist can see medical records?', type: 'select', required: true, options: ['Full access', 'Limited (Contact only)', 'No access'] },
  { id: 'inventory_mgmt', section: 'Operations', question: 'Do you manage medicine/supply inventory?', type: 'yes_no_detail', required: true, yesLabel: 'Yes', noLabel: 'No' },
  { id: 'staff_attendance', section: 'Operations', question: 'How is staff attendance tracked?', type: 'select', options: ['Biometric', 'Manual Register', 'Mobile App', 'Not tracked'] },
  { id: 'telemed_interest', section: 'Operations', question: 'Interested in Telemedicine features?', type: 'slider', required: false },

  // Section 6: Communication (4)
  { id: 'followup_needed', section: 'Communication', question: 'Do patients require follow-ups?', type: 'select', required: true, options: ['Most patients', 'Specific cases', 'Chronic only', 'Rarely'] },
  { id: 'notification_channels', section: 'Communication', question: 'System notification channels?', type: 'multi_checkbox', required: true, options: ['Email', 'SMS', 'WhatsApp', 'In-app'] },
  { id: 'reminder_priority', section: 'Communication', question: 'How critical are automated reminders?', type: 'slider', required: false },
  { id: 'go_live_date', section: 'Communication', question: 'Proposed Go-Live date for the system?', type: 'date', required: true }
];

const SCHOOL_QUESTIONS = [
  // Section 1: School Basics (5)
  { id: 'school_name', section: 'School Basics', question: 'Full name of your school?', type: 'text', placeholder: 'e.g., Beacon Institute', required: true },
  { id: 'school_type', section: 'School Basics', question: 'Type of institution?', type: 'select', required: true, options: ['Primary', 'Secondary', 'College', 'O/A Level', 'University', 'Vocational', 'Tutoring'] },
  { id: 'student_count', section: 'School Basics', question: 'Student enrollment?', type: 'select', required: true, options: ['<100', '100–300', '300–500', '500–1000', '1000+'] },
  { id: 'staff_count_school', section: 'School Basics', question: 'Teaching & Admin staff count?', type: 'select', required: true, options: ['1–10', '11–25', '26–50', '51–100', '100+'] },
  { id: 'campus_count', section: 'School Basics', question: 'Campus locations?', type: 'select', required: true, options: ['1', '2', '3–5', '5+'] },

  // Section 2: Admissions (6)
  { id: 'admission_seasons', section: 'Admissions', question: 'When are new students accepted?', type: 'multi_checkbox', required: true, options: ['Spring', 'Main Annual', 'Fall', 'Rolling'] },
  { id: 'admission_requirements', section: 'Admissions', question: 'Process requirements?', type: 'multi_checkbox', required: true, options: ['Application Form', 'Transcripts', 'Test', 'Interview', 'Parent meeting', 'B-Form copy'] },
  { id: 'admission_test_type', section: 'Admissions', question: 'Admission test subjects?', type: 'multi_checkbox', options: ['Math', 'English', 'Science', 'IQ', 'No test'] },
  { id: 'admission_decision_time', section: 'Admissions', question: 'Decision timeline?', type: 'select', required: true, options: ['Same day', '1–3 days', '1 week', '2–4 weeks'] },
  { id: 'admission_waitlist', section: 'Admissions', question: 'Manage a waitlist?', type: 'yes_no_detail', required: true, yesLabel: 'Yes', noLabel: 'No' },
  { id: 'admission_priority', section: 'Admissions', question: 'Importance of sibling/legacy priority?', type: 'slider', required: false },

  // Section 3: Student Records (6)
  { id: 'student_data_tracked', section: 'Records', question: 'Student info tracked?', type: 'multi_checkbox', required: true, options: ['Personal', 'Parent Contact', 'Address', 'Results', 'Attendance', 'Health', 'Disciplinary'] },
  { id: 'current_record_system', section: 'Records', question: 'Current record system?', type: 'multi_checkbox', required: true, options: ['Paper files', 'Excel', 'Software', 'WhatsApp'] },
  { id: 'result_cards', section: 'Records', question: 'Distribution of results?', type: 'select', required: true, options: ['Printed', 'Sent home', 'Notice board', 'Email/WhatsApp', 'Portal'] },
  { id: 'attendance_tracking', section: 'Records', question: 'Attendance tracking method?', type: 'select', required: true, options: ['Paper register', 'Teacher mobile', 'Biometric', 'RFID', 'Not tracked'] },
  { id: 'hostel_mgmt', section: 'Records', question: 'Do you manage hostel/boarding?', type: 'yes_no_detail', required: false, yesLabel: 'Yes', noLabel: 'No' },
  { id: 'record_update_date', section: 'Records', question: 'Next scheduled data update?', type: 'date', required: false },

  // Section 4: Fees & Finance (6)
  { id: 'fee_structure', section: 'Fees', question: 'Types of fees charged?', type: 'multi_checkbox', required: true, options: ['Tuition', 'Admission', 'Exam', 'Transport', 'Books', 'Uniform'] },
  { id: 'fee_frequency', section: 'Fees', question: 'Payment frequency?', type: 'select', required: true, options: ['Monthly', 'Quarterly', 'Bi-annually', 'Annually'] },
  { id: 'fee_collection_method', section: 'Fees', question: 'Current payment methods?', type: 'multi_checkbox', required: true, options: ['Cash', 'Bank/Cheque', 'JazzCash', 'Online', 'Card'] },
  { id: 'fee_defaulters', section: 'Fees', question: 'Defaulter policy?', type: 'multi_checkbox', required: true, options: ['Reminder', 'Late fine', 'Block Exams', 'Block Class'] },
  { id: 'fee_concession', section: 'Fees', question: 'Scholarship program?', type: 'yes_no_detail', required: true, yesLabel: 'Yes', noLabel: 'No' },
  { id: 'scholarship_budget', section: 'Fees', question: 'What percentage of revenue goes to scholarships?', type: 'slider', required: false },

  // Section 5: Staff & Roles (5)
  { id: 'school_roles', section: 'Staff', question: 'System access roles?', type: 'multi_checkbox', required: true, options: ['Principal', 'Class Teacher', 'Subject Teacher', 'Admission', 'Finance'] },
  { id: 'parent_access', section: 'Staff', question: 'Parent portal access?', type: 'select', required: true, options: ['Full portal', 'Limited (Fees/Results)', 'No access'] },
  { id: 'library_mgmt', section: 'Staff', question: 'Manage library books/issuance?', type: 'yes_no_detail', required: true, yesLabel: 'Yes', noLabel: 'No' },
  { id: 'teacher_evaluation', section: 'Staff', question: 'Perform digital teacher evaluations?', type: 'yes_no_detail', options: ['Yes', 'No'] },
  { id: 'staff_training_priority', section: 'Staff', question: 'Priority for digital training for staff?', type: 'slider', required: false },

  // Section 6: Communication (4)
  { id: 'parent_communication', section: 'Communication', question: 'Current parent comms?', type: 'multi_checkbox', required: true, options: ['Phone', 'SMS', 'WhatsApp', 'Email', 'Letters', 'PTM'] },
  { id: 'sms_alerts', section: 'Communication', question: 'Events for auto-alerts?', type: 'multi_checkbox', options: ['Absence', 'Fee reminder', 'Exam schedule', 'Results', 'Closure'] },
  { id: 'digital_comms_focus', section: 'Communication', question: 'How much should we focus on digital vs paper comms?', type: 'slider', required: false },
  { id: 'term_start_date', section: 'Communication', question: 'Next academic term start date?', type: 'date', required: true }
];

async function seedQuestions() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI is not defined');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing
    await IntakeQuestion.deleteMany({});
    console.log('Cleared existing questions');

    const allQuestions = [
      ...CLINIC_QUESTIONS.map((q, i) => ({ ...q, category: 'clinic', order: i })),
      ...SCHOOL_QUESTIONS.map((q, i) => ({ ...q, category: 'school', order: i }))
    ];

    await IntakeQuestion.insertMany(allQuestions);
    console.log(`Inserted ${allQuestions.length} questions successfully`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedQuestions();
