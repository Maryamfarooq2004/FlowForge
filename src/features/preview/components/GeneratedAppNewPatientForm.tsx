import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface GeneratedAppNewPatientFormProps {
  onBack?: () => void;
}

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-1 h-4 bg-[#0F766E] rounded-full" />
    <p className="text-[10px] font-bold uppercase tracking-widest text-[#0F766E]">{title}</p>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode; span?: boolean }> = ({ label, children, span }) => (
  <div className={span ? 'md:col-span-2' : ''}>
    <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full h-9 border border-slate-200 rounded-lg px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all bg-white";
const selectCls = `${inputCls} appearance-none`;

export const GeneratedAppNewPatientForm: React.FC<GeneratedAppNewPatientFormProps> = ({ onBack }) => (
  <div className="p-5">
    {/* Breadcrumb + Header */}
    <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-[#0F766E] font-semibold hover:underline mb-3">
      <ChevronLeft size={14} />
      Patients &rsaquo; New Patient
    </button>
    <h1 className="text-lg font-bold text-slate-900 font-poppins mb-5">New Patient Registration</h1>

    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Personal Information */}
      <section>
        <SectionHeader title="Personal Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full Name">
            <input type="text" placeholder="Enter full name" className={inputCls} />
          </Field>
          <Field label="Phone Number">
            <div className="flex">
              <span className="flex items-center px-3 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-xs text-slate-500 font-semibold">+92</span>
              <input type="text" placeholder="300 1234567" className={`${inputCls} rounded-l-none`} />
            </div>
          </Field>
          <Field label="Date of Birth">
            <input type="date" className={inputCls} />
          </Field>
          <Field label="Gender">
            <div className="flex gap-4 h-9 items-center">
              {['Male', 'Female', 'Other'].map(g => (
                <label key={g} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="gender" className="accent-[#0F766E]" />
                  <span className="text-xs text-slate-700">{g}</span>
                </label>
              ))}
            </div>
          </Field>
          <Field label="Email Address">
            <input type="email" placeholder="Email (optional)" className={inputCls} />
          </Field>
          <Field label="Reason for Visit">
            <select className={selectCls}>
              <option value="">Select reason...</option>
              <option>General Checkup</option>
              <option>Emergency</option>
              <option>Follow-up</option>
              <option>Specialist Referral</option>
            </select>
          </Field>
        </div>
      </section>

      {/* Medical Background */}
      <section>
        <SectionHeader title="Medical Background" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Blood Group">
            <select className={selectCls}>
              <option value="">Select blood group...</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Emergency Contact Name">
            <input type="text" placeholder="Full name" className={inputCls} />
          </Field>
          <Field label="Allergies" span>
            <textarea
              placeholder="List known allergies, or type 'None'"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all resize-none h-16"
            />
          </Field>
          <Field label="Emergency Contact Phone">
            <input type="text" placeholder="+92 XXX XXXXXXX" className={inputCls} />
          </Field>
        </div>
      </section>

      {/* Appointment Details */}
      <section>
        <SectionHeader title="Appointment Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Date">
            <input type="date" className={inputCls} defaultValue="2026-05-09" />
          </Field>
          <Field label="Time">
            <select className={selectCls}>
              {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '16:00', '17:00'].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Doctor">
            <select className={selectCls}>
              <option>Dr. Ahmad — General</option>
              <option>Maryam — Specialist</option>
            </select>
          </Field>
          <Field label="Notes" span>
            <textarea
              placeholder="Any special instructions for the doctor..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all resize-none h-16"
            />
          </Field>
        </div>
      </section>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <p className="text-[10px] text-slate-400">* Required fields</p>
        <div className="flex gap-3">
          <button onClick={onBack} className="h-9 px-4 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button className="h-9 px-5 bg-[#0F766E] hover:bg-[#0D6B63] text-white rounded-lg text-xs font-bold transition-colors">
            Register & Book Appointment →
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default GeneratedAppNewPatientForm;
