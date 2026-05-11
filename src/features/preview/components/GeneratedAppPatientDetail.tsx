import React, { useState } from 'react';
import { ChevronLeft, Phone, Mail, MoreVertical, Calendar, FileText, CreditCard, FolderOpen, Activity } from 'lucide-react';
import { cn } from '../../../utils/classNames';

type TabId = 'overview' | 'visits' | 'prescriptions' | 'payments' | 'documents';
const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'visits', label: 'Visit History' },
  { id: 'prescriptions', label: 'Prescriptions' },
  { id: 'payments', label: 'Payments' },
  { id: 'documents', label: 'Documents' },
];

const TIMELINE = [
  { label: 'Today', event: 'Appointment booked for May 10', color: 'bg-[#0F766E]', sub: '' },
  { label: '8 May 2026', event: 'Visit completed — Dr. Ahmad', color: 'bg-green-500', sub: 'BP 140/90 — medication adjusted' },
  { label: '1 May 2026', event: 'Prescription renewed', color: 'bg-blue-500', sub: '' },
  { label: '15 Apr 2026', event: 'Follow-up completed', color: 'bg-green-500', sub: '' },
];

interface GeneratedAppPatientDetailProps {
  onBack?: () => void;
}

export const GeneratedAppPatientDetail: React.FC<GeneratedAppPatientDetailProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <div className="p-5 space-y-4">
      {/* Breadcrumb */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-[#0F766E] font-semibold hover:underline">
        <ChevronLeft size={14} />
        Patients &rsaquo; User Name
      </button>

      {/* Patient Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-5 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xl font-bold shrink-0">AK</div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-slate-900 font-poppins">User Name</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
            <span>Male</span>
            <span className="text-slate-300">·</span>
            <span>35 years</span>
            <span className="text-slate-300">·</span>
            <span className="font-mono font-semibold text-slate-600">PAT-001</span>
            <span className="text-slate-300">·</span>
            <span>Registered: 15 Jan 2026</span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Phone size={11} /> +92 300 1234567</span>
            <span className="flex items-center gap-1"><Mail size={11} /> user@email.com</span>
          </div>
          <div className="flex gap-2 mt-3">
            <span className="bg-teal-100 text-teal-700 text-[10px] font-bold px-2.5 py-1 rounded-full">Hypertension</span>
            <span className="bg-teal-100 text-teal-700 text-[10px] font-bold px-2.5 py-1 rounded-full">On Medication</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-1.5 bg-[#0F766E] text-white rounded-lg px-3 py-2 text-xs font-bold hover:bg-[#0D6B63]">
            <Calendar size={13} /> Book Appointment
          </button>
          <button className="flex items-center gap-1.5 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-slate-50">
            Edit Patient
          </button>
          <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-slate-200">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2.5 text-xs font-semibold transition-colors border-b-2',
              activeTab === tab.id
                ? 'text-[#0F766E] border-[#0F766E]'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Content */}
      {activeTab === 'overview' && (
        <div className="flex gap-4">
          {/* Medical Info */}
          <div className="flex-1 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h2 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2">
              <Activity size={15} className="text-[#0F766E]" /> Medical History
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Condition', value: 'Hypertension' },
                { label: 'Blood Group', value: 'B+' },
                { label: 'Allergies', value: 'Penicillin' },
                { label: 'Emergency Contact', value: 'Fatima Khan — +92 311 0000000' },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-xs border-b border-slate-50 pb-2 last:border-0">
                  <span className="text-slate-400 font-medium">{item.label}</span>
                  <span className="text-slate-700 font-semibold text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="w-64 shrink-0 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h2 className="font-semibold text-slate-800 text-sm mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {TIMELINE.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn('w-2.5 h-2.5 rounded-full shrink-0 mt-0.5', item.color)} />
                    {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-slate-100 mt-1" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-[10px] text-slate-400 font-medium">{item.label}</p>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{item.event}</p>
                    {item.sub && <p className="text-[10px] text-slate-400 mt-0.5">{item.sub}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'overview' && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          {activeTab === 'visits' && <FileText size={40} className="text-slate-200 mx-auto mb-3" />}
          {activeTab === 'prescriptions' && <FileText size={40} className="text-slate-200 mx-auto mb-3" />}
          {activeTab === 'payments' && <CreditCard size={40} className="text-slate-200 mx-auto mb-3" />}
          {activeTab === 'documents' && <FolderOpen size={40} className="text-slate-200 mx-auto mb-3" />}
          <p className="text-sm font-semibold text-slate-400">No {activeTab} records yet</p>
        </div>
      )}
    </div>
  );
};

export default GeneratedAppPatientDetail;
