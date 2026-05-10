import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { IntakeQuestion } from '../models/IntakeQuestion.model';

// Fix for Atlas DNS resolution
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const CLINIC_QUESTIONS = [
  { id: 'clinic_name', section: 'Practice Basics', question: 'What is the name of your clinic?', type: 'text', placeholder: 'e.g., Al-Shifa Medical Center', required: true },
  { id: 'clinic_type', section: 'Practice Basics', question: 'What type of medical practice do you run?', type: 'select', required: true, options: ['General Practice / Family Medicine', 'Pediatric Clinic', 'Gynecology & Obstetrics', 'Dental Clinic', 'Eye / Ophthalmology Clinic', 'Orthopedic Clinic', 'Dermatology Clinic', 'ENT Clinic', 'Cardiology Clinic', 'Multi-Specialty Clinic'] },
  { id: 'doctor_count', section: 'Practice Basics', question: 'How many doctors work at your clinic?', type: 'select', required: true, options: ['1 (Solo practice)', '2–3', '4–6', '7–10', 'More than 10'] },
  { id: 'staff_count', section: 'Practice Basics', question: 'How many support staff members do you have?', type: 'select', required: true, options: ['1–2', '3–5', '6–10', 'More than 10'] },
  { id: 'operating_hours', section: 'Practice Basics', question: 'What are your clinic operating hours?', type: 'select', required: true, options: ['Morning only (8am–2pm)', 'Evening only (5pm–10pm)', 'Morning and Evening (split shift)', 'Full day (8am–8pm)', '24/7 Emergency'] },
  { id: 'daily_patients', section: 'Patient Flow', question: 'How many patients does your clinic see per day on average?', type: 'select', required: true, options: ['1–15', '16–30', '31–50', '51–80', 'More than 80'] },
  { id: 'appointment_types', section: 'Patient Flow', question: 'Which types of appointments do you handle?', type: 'multi_checkbox', required: true, options: ['Walk-in patients only', 'Pre-booked appointments', 'Emergency walk-ins', 'Follow-up visits', 'Video / Teleconsultation'] },
  { id: 'booking_method', section: 'Patient Flow', question: 'How do patients currently book appointments?', type: 'multi_checkbox', required: true, options: ['Phone call to receptionist', 'Walk in and register', 'WhatsApp message', 'Online / Website booking', 'Through a third-party app'] },
  { id: 'avg_consultation_time', section: 'Patient Flow', question: 'How long is a typical consultation?', type: 'select', required: true, options: ['5–10 minutes', '10–20 minutes', '20–30 minutes', '30–60 minutes', 'Varies by case'] },
  { id: 'patient_return', section: 'Patient Flow', question: 'What percentage of your patients are returning (not first-time)?', type: 'select', required: false, options: ['Less than 20%', '20–40%', '40–60%', '60–80%', 'More than 80%'] },
  { id: 'records_currently', section: 'Patient Records', question: 'How do you currently store patient records?', type: 'multi_checkbox', required: true, options: ['Paper registers / files', 'Excel or Google Sheets', 'Basic desktop software', 'WhatsApp notes', 'Memory / verbal'] },
  { id: 'record_fields', section: 'Patient Records', question: 'What information do you record for each patient?', type: 'multi_checkbox', required: true, options: ['Patient name and CNIC', 'Contact number', 'Age and date of birth', 'Address', 'Medical history', 'Allergies and medications', 'Previous visit notes', 'Lab results', 'Uploaded documents / scans'] },
  { id: 'prescription_format', section: 'Patient Records', question: 'How do doctors currently write prescriptions?', type: 'select', required: true, options: ['Handwritten on prescription pad', 'Typed and printed', 'Verbally told to patient', 'WhatsApp / SMS to patient'] },
  { id: 'lab_tests', section: 'Patient Records', question: 'Does your clinic order lab tests or refer to external labs?', type: 'yes_no_detail', required: true, yesLabel: 'Yes — we refer patients to labs', noLabel: 'No — we do not order lab tests' },
  { id: 'consultation_fee', section: 'Billing & Payments', question: 'Do you charge a fixed consultation fee or variable fee?', type: 'select', required: true, options: ['Fixed fee for all patients', 'Different fee by doctor', 'Different fee by visit type', 'Fee waived for some patients', 'Insurance covers most fees'] },
  { id: 'payment_methods', section: 'Billing & Payments', question: 'Which payment methods does your clinic accept?', type: 'multi_checkbox', required: true, options: ['Cash only', 'Bank transfer', 'JazzCash / EasyPaisa', 'Credit / Debit card', 'Insurance billing', 'Monthly billing / credit'] },
  { id: 'receipt_required', section: 'Billing & Payments', question: 'Do you provide printed or digital receipts to patients?', type: 'select', required: true, options: ['Always provide printed receipt', 'Always send digital receipt', 'Only when patient asks', 'We do not currently provide receipts'] },
  { id: 'pending_payments', section: 'Billing & Payments', question: 'How do you handle patients with outstanding/unpaid fees?', type: 'select', required: true, options: ['We block future appointments until paid', 'We allow credit and follow up later', 'We write it off — not tracked', 'We require full payment before seeing patient'] },
  { id: 'followup_needed', section: 'Follow-ups & Notifications', question: 'Do your patients require follow-up appointments?', type: 'select', required: true, options: ['Yes — most patients need follow-ups', 'Yes — for specific conditions only', 'Rarely — only for chronic patients', 'No — single-visit only'] },
  { id: 'followup_reminder', section: 'Follow-ups & Notifications', question: 'How do you currently remind patients about follow-ups?', type: 'multi_checkbox', required: false, options: ['We call the patient', 'We send a WhatsApp message', 'We send an SMS', 'We rely on the patient to remember', 'We do not currently send reminders'] },
  { id: 'notification_channels', section: 'Follow-ups & Notifications', question: 'Which channels should the system use for patient notifications?', type: 'multi_checkbox', required: true, options: ['Email', 'SMS', 'WhatsApp', 'In-app notification', 'No notifications needed'] },
  { id: 'internal_alerts', section: 'Follow-ups & Notifications', question: 'Should staff receive alerts for specific events?', type: 'multi_checkbox', required: false, options: ['New appointment booked', 'Patient has unpaid balance', 'Follow-up due today', 'Low medicine stock', 'New lab result available'] },
  { id: 'staff_roles', section: 'Roles & Access', question: 'Which staff roles need access to the system?', type: 'multi_checkbox', required: true, options: ['Receptionist (booking, registration)', 'Doctor (records, prescriptions)', 'Nurse (vitals, notes)', 'Billing Staff (payments, receipts)', 'Clinic Manager (all access)', 'Lab Technician (results entry)'] },
  { id: 'receptionist_access', section: 'Roles & Access', question: 'Should the receptionist be able to see patient medical records?', type: 'select', required: true, options: ['Yes — full access', 'Limited — only contact info and appointment history', 'No — medical records for doctors only'] },
  { id: 'data_privacy', section: 'Roles & Access', question: 'Are there any patient data privacy rules you follow?', type: 'multi_checkbox', required: false, options: ['Patient records visible to assigned doctor only', 'No one can delete patient records', 'All access actions should be logged', 'Family members can view patient records', 'No special rules'] }
];

const SCHOOL_QUESTIONS = [
  { id: 'school_name', section: 'School Basics', question: 'What is the full name of your school?', type: 'text', placeholder: 'e.g., Beacon Institute of Sciences', required: true },
  { id: 'school_type', section: 'School Basics', question: 'What type of educational institution are you?', type: 'select', required: true, options: ['Primary School (Grade 1–5)', 'Secondary School (Grade 6–10)', 'Higher Secondary / College (Grade 11–12)', 'O/A Level School', 'Full School (Grade 1–12)', 'University / College', 'Vocational Training Institute', 'Tutoring / Coaching Center'] },
  { id: 'student_count', section: 'School Basics', question: 'What is your current student enrollment?', type: 'select', required: true, options: ['Less than 100', '100–300', '300–500', '500–1000', 'More than 1000'] },
  { id: 'staff_count_school', section: 'School Basics', question: 'How many teaching and administrative staff do you have?', type: 'select', required: true, options: ['1–10', '11–25', '26–50', '51–100', 'More than 100'] },
  { id: 'campus_count', section: 'School Basics', question: 'How many campus locations does your school operate?', type: 'select', required: true, options: ['1 campus', '2 campuses', '3–5 campuses', 'More than 5 campuses'] },
  { id: 'admission_seasons', section: 'Admissions Process', question: 'When do you accept new student applications?', type: 'multi_checkbox', required: true, options: ['January–February (Spring intake)', 'June–August (Main annual intake)', 'September–October (Fall intake)', 'Rolling admissions (year-round)'] },
  { id: 'admission_requirements', section: 'Admissions Process', question: 'What does your admission process require from applicants?', type: 'multi_checkbox', required: true, options: ['Completion of online/paper application form', 'Previous school result cards / transcripts', 'Admission entrance test', 'In-person interview', 'Parent/guardian meeting', 'CNIC / B-Form copy', 'Medical fitness certificate', 'Character certificate from previous school'] },
  { id: 'admission_test_type', section: 'Admissions Process', question: 'If you conduct an admission test, what does it cover?', type: 'multi_checkbox', required: false, options: ['Mathematics', 'English language', 'Urdu / Islamiat', 'Science', 'General knowledge / IQ', 'We do not conduct admission tests'] },
  { id: 'admission_decision_time', section: 'Admissions Process', question: 'How long does your admission decision process take?', type: 'select', required: true, options: ['Same day — decision given immediately', '1–3 days', '1 week', '2–4 weeks', 'Depends on seat availability'] },
  { id: 'admission_waitlist', section: 'Admissions Process', question: 'Do you maintain a waitlist for oversubscribed classes?', type: 'yes_no_detail', required: true, yesLabel: 'Yes — we have a waitlist system', noLabel: 'No — we do not manage a waitlist' },
  { id: 'student_data_tracked', section: 'Student Records', question: 'What student information do you track in your system?', type: 'multi_checkbox', required: true, options: ['Personal info (name, DOB, CNIC)', 'Parent / guardian contact details', 'Home address', 'Previous academic results', 'Current class and section', 'Attendance record', 'Exam scores and report cards', 'Health / medical conditions', 'Extracurricular activities', 'Disciplinary records'] },
  { id: 'current_record_system', section: 'Student Records', question: 'How do you currently maintain student records?', type: 'multi_checkbox', required: true, options: ['Paper files per student', 'Excel spreadsheets', 'Basic desktop software', 'Partially digital, partially paper', 'WhatsApp groups for communication'] },
  { id: 'result_cards', section: 'Student Records', question: 'How do you generate and distribute result cards?', type: 'select', required: true, options: ['Printed and handed to parents on result day', 'Sent home with students', 'Posted on school notice board', 'Emailed or WhatsApp to parents', 'Available online via parent portal'] },
  { id: 'attendance_tracking', section: 'Student Records', question: 'How is student attendance currently tracked?', type: 'select', required: true, options: ['Paper register in each classroom', 'Teacher marks on mobile/tablet', 'Biometric attendance system', 'RFID card-based system', 'We do not currently track attendance digitally'] },
  { id: 'fee_structure', section: 'Fee Management', question: 'What fees does your school charge students?', type: 'multi_checkbox', required: true, options: ['Monthly tuition fee', 'Annual registration / admission fee', 'Examination fee', 'Transport / bus fee', 'Books / stationery fee', 'Lab / computer lab fee', 'Uniform fee', 'Extracurricular activities fee'] },
  { id: 'fee_frequency', section: 'Fee Management', question: 'How often do students pay tuition?', type: 'select', required: true, options: ['Monthly', 'Quarterly (every 3 months)', 'Bi-annually (twice a year)', 'Annually'] },
  { id: 'fee_collection_method', section: 'Fee Management', question: 'How do parents currently pay fees?', type: 'multi_checkbox', required: true, options: ['Cash to school office', 'Bank deposit / cheque', 'JazzCash / EasyPaisa', 'Online banking transfer', 'Credit / Debit card'] },
  { id: 'fee_defaulters', section: 'Fee Management', question: 'What happens if a student does not pay fees on time?', type: 'multi_checkbox', required: true, options: ['Reminder SMS / call to parent', 'Late fee fine applied', 'Student not allowed in exams', 'Student not allowed to attend class', 'Name published on notice board', 'We are lenient — no strict rules'] },
  { id: 'fee_concession', section: 'Fee Management', question: 'Do you offer fee concessions or scholarships?', type: 'yes_no_detail', required: true, yesLabel: 'Yes — we have a concession / scholarship program', noLabel: 'No — full fee from all students' },
  { id: 'school_roles', section: 'Staff & Roles', question: 'Which staff roles need system access?', type: 'multi_checkbox', required: true, options: ['Principal (full administrative access)', 'Vice Principal', 'Class Teacher (attendance, marks)', 'Subject Teacher (marks only)', 'Admission Officer', 'Accounts / Finance Staff', 'IT / System Administrator'] },
  { id: 'parent_access', section: 'Staff & Roles', question: 'Should parents have access to a portal to view their child\'s information?', type: 'select', required: true, options: ['Yes — full parent portal with attendance, marks, fees', 'Yes — but limited to fees and result cards only', 'No — all communication through school office'] },
  { id: 'approval_hierarchy', section: 'Staff & Roles', question: 'For fee waivers or admissions, who has final approval authority?', type: 'select', required: true, options: ['Principal approves all exceptions', 'Vice Principal approves financial matters', 'Committee decision required', 'Each department head decides independently'] },
  { id: 'parent_communication', section: 'Communication', question: 'How do you communicate with parents?', type: 'multi_checkbox', required: true, options: ['Phone calls', 'SMS messages', 'WhatsApp (individual or group)', 'Email', 'Printed letters sent home', 'Parent-teacher meetings'] },
  { id: 'sms_alerts', section: 'Communication', question: 'What events should trigger automatic alerts to parents?', type: 'multi_checkbox', required: false, options: ['Student absence notification', 'Fee reminder / overdue fee', 'Exam schedule announcement', 'Result card available', 'School closure / holiday announcement', 'Admission decision notification'] },
  { id: 'language_preference', section: 'Communication', question: 'What language do you use for official communications?', type: 'multi_checkbox', required: true, options: ['English', 'Urdu', 'Both English and Urdu'] }
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
