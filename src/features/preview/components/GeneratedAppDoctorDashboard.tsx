import React from 'react';
import { Users, FileText, CalendarClock, AlertCircle, Filter } from 'lucide-react';
import { cn } from '../../../utils/classNames';

const KpiCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  value: string;
  label: string;
  sub: React.ReactNode;
}> = ({ icon, iconBg, value, label, sub }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow flex-1">
    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', iconBg)}>
      {icon}
    </div>
    <p className="text-2xl font-bold text-slate-900 font-poppins leading-none mb-1">{value}</p>
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
    <div className="text-xs">{sub}</div>
  </div>
);

const APPOINTMENTS = [
  { time: '09:30 AM', patient: 'User Name', reason: 'General Checkup', status: 'SCHEDULED' },
  { time: '10:15 AM', patient: 'Fatima Malik', reason: 'Follow-up', status: 'CONFIRMED' },
  { time: '11:00 AM', patient: 'Zara Hussain', reason: 'Blood Pressure Review', status: 'CONFIRMED' },
  { time: '12:30 PM', patient: '—', reason: 'Lunch Break', status: 'BLOCKED' },
  { time: '02:00 PM', patient: 'Omar Riaz', reason: 'Prescription Renewal', status: 'VISITED' },
];

const statusConfig: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-teal-100 text-teal-700',
  BLOCKED: 'bg-slate-100 text-slate-400',
  VISITED: 'bg-green-100 text-green-700',
};

export const GeneratedAppDoctorDashboard: React.FC = () => (
  <div className="p-5 space-y-5">
    {/* Header */}
    <div>
      <h1 className="text-xl font-bold text-slate-900 font-poppins">Good morning, Dr. Ahmad</h1>
      <p className="text-sm text-slate-500">My Organization — Medical Dashboard</p>
    </div>

    {/* KPIs */}
    <div className="flex gap-3">
      <KpiCard
        icon={<Users size={18} className="text-blue-600" />}
        iconBg="bg-blue-50"
        value="8"
        label="Patients Today"
        sub={<span className="text-slate-400">3 pending, 5 visited</span>}
      />
      <KpiCard
        icon={<FileText size={18} className="text-amber-600" />}
        iconBg="bg-amber-50"
        value="3"
        label="Prescriptions"
        sub={<span className="text-slate-400">Awaiting your approval</span>}
      />
      <KpiCard
        icon={<CalendarClock size={18} className="text-green-600" />}
        iconBg="bg-green-50"
        value="5"
        label="Follow-ups Due"
        sub={<><span className="text-red-500 font-semibold">2 overdue</span></>}
      />
      <KpiCard
        icon={<AlertCircle size={18} className="text-red-500" />}
        iconBg="bg-red-50"
        value="2"
        label="Alerts"
        sub={<span className="text-slate-400">Lab results pending</span>}
      />
    </div>

    {/* Bottom two-column */}
    <div className="flex gap-4">
      {/* Schedule table */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 text-sm">My Schedule — Tuesday, 9 May</h2>
          <button className="text-slate-400 hover:text-slate-600"><Filter size={14} /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">Reason</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {APPOINTMENTS.map((a, i) => (
                <tr
                  key={i}
                  className={cn(
                    'hover:bg-slate-50 transition-colors',
                    a.status === 'BLOCKED' && 'opacity-40'
                  )}
                >
                  <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">{a.time}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{a.patient}</td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{a.reason}</td>
                  <td className="px-4 py-3">
                    <span className={cn('text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full', statusConfig[a.status])}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {a.status !== 'BLOCKED' && (
                      <div className="flex items-center justify-end gap-1.5">
                        {a.status === 'VISITED' ? (
                          <>
                            <button className="bg-slate-100 text-slate-600 rounded-md px-2 py-1 text-[10px] font-semibold hover:bg-slate-200">Add Notes</button>
                            <button className="bg-[#0F766E] text-white rounded-md px-2 py-1 text-[10px] font-semibold hover:bg-[#0D6B63]">Prescribe</button>
                          </>
                        ) : (
                          <>
                            <button className="bg-[#0F766E] text-white rounded-md px-2 py-1 text-[10px] font-semibold hover:bg-[#0D6B63] whitespace-nowrap">Start</button>
                            <button className="border border-slate-200 text-slate-600 rounded-md px-2 py-1 text-[10px] font-semibold hover:bg-slate-50 whitespace-nowrap">History</button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Notes */}
      <div className="w-64 shrink-0 space-y-3">
        <h2 className="font-semibold text-slate-800 text-sm px-1">Recent Notes</h2>
        <div className="bg-slate-50 rounded-xl p-3.5 border-l-2 border-[#0F766E]">
          <p className="text-xs font-semibold text-slate-800 mb-1">Fatima Malik</p>
          <p className="text-xs text-slate-500 leading-relaxed">BP 140/90 - hypertension follow-up — adjusted medication dosage</p>
          <p className="text-[10px] text-slate-400 mt-2">Today 09:15 AM</p>
          <div className="flex gap-1 mt-2">
            <span className="bg-teal-100 text-teal-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">Blood Pressure</span>
            <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">Medication</span>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3.5 border-l-2 border-[#0F766E]">
          <p className="text-xs font-semibold text-slate-800 mb-1">User Name</p>
          <p className="text-xs text-slate-500 leading-relaxed">Routine check, all vitals normal — scheduled 6-month follow-up</p>
          <p className="text-[10px] text-slate-400 mt-2">Yesterday 03:30 PM</p>
        </div>
      </div>
    </div>

    {/* Role badge */}
    <div className="bg-indigo-600 rounded-xl px-4 py-3 text-white text-xs font-semibold flex items-center gap-2">
      🩺 Doctor view — Prescriptions, Diagnosis, and Patient History enabled.
    </div>
  </div>
);

export default GeneratedAppDoctorDashboard;
