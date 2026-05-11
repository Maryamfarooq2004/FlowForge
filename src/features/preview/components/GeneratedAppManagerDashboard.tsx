import React from 'react';
import { DollarSign, Calendar, CreditCard, Users, CheckCircle2, Zap, Clock, Check, X } from 'lucide-react';
import { cn } from '../../../utils/classNames';

const KpiCard: React.FC<{ icon: React.ReactNode; iconBg: string; value: string; label: string; sub: React.ReactNode }> = ({ icon, iconBg, value, label, sub }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex-1">
    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', iconBg)}>{icon}</div>
    <p className="text-xl font-bold text-slate-900 font-poppins leading-none mb-1">{value}</p>
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
    <div className="text-xs">{sub}</div>
  </div>
);

const APPOINTMENTS = [
  { doctor: 'Dr. Ahmad', patient: 'User Name', time: '09:30', status: 'VISITED', statusIcon: CheckCircle2, color: 'text-green-600' },
  { doctor: 'Dr. Ahmad', patient: 'Fatima Malik', time: '10:15', status: 'IN PROGRESS', statusIcon: Zap, color: 'text-blue-600' },
  { doctor: 'Maryam', patient: 'Zara Hussain', time: '10:00', status: 'CONFIRMED', statusIcon: Clock, color: 'text-teal-600' },
  { doctor: 'Maryam', patient: 'Omar Riaz', time: '11:30', status: 'SCHEDULED', statusIcon: Clock, color: 'text-slate-400' },
];

const REVENUE_BARS = [
  { day: 'Mon', value: 38, amount: '38k' },
  { day: 'Tue', value: 42.5, amount: '42.5k', today: true },
  { day: 'Wed', value: 35, amount: '35k' },
  { day: 'Thu', value: 50, amount: '50k' },
  { day: 'Fri', value: 28, amount: '28k' },
  { day: 'Sat', value: 15, amount: '15k' },
  { day: 'Sun', value: 8, amount: '8k' },
];

export const GeneratedAppManagerDashboard: React.FC = () => (
  <div className="p-5 space-y-5">
    <div>
      <h1 className="text-xl font-bold text-slate-900 font-poppins">Good morning, Manager</h1>
      <p className="text-sm text-slate-500">Operations Overview</p>
    </div>

    {/* KPIs */}
    <div className="flex gap-3">
      <KpiCard
        icon={<DollarSign size={18} className="text-green-600" />}
        iconBg="bg-green-50"
        value="PKR 42,500"
        label="Revenue Today"
        sub={<span className="text-green-600 font-semibold">↑ 12% from yesterday</span>}
      />
      <KpiCard
        icon={<Calendar size={18} className="text-blue-600" />}
        iconBg="bg-blue-50"
        value="24"
        label="Total Appointments"
        sub={<span className="text-slate-400">18 completed, 6 pending</span>}
      />
      <KpiCard
        icon={<CreditCard size={18} className="text-amber-600" />}
        iconBg="bg-amber-50"
        value="PKR 8,400"
        label="Outstanding"
        sub={<span className="text-amber-600 font-semibold">3 patients</span>}
      />
      <KpiCard
        icon={<Users size={18} className="text-slate-600" />}
        iconBg="bg-slate-100"
        value="6"
        label="Staff on Duty"
        sub={<span className="text-slate-400">2 Doctors · 3 Recept. · 1 Admin</span>}
      />
    </div>

    {/* Operations row */}
    <div className="flex gap-4">
      {/* Today's flow */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 text-sm">Today's Appointment Flow</h2>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Doctor</th>
              <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient</th>
              <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</th>
              <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {APPOINTMENTS.map((a, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-medium text-slate-700">{a.doctor}</td>
                <td className="px-4 py-2.5 text-slate-600">{a.patient}</td>
                <td className="px-4 py-2.5 font-mono text-slate-500">{a.time}</td>
                <td className="px-4 py-2.5">
                  <div className={cn('flex items-center gap-1 font-semibold text-[10px]', a.color)}>
                    <a.statusIcon size={11} />
                    {a.status}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Revenue chart */}
      <div className="w-56 shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <h2 className="font-semibold text-slate-800 text-sm mb-3">Revenue — Last 7 Days</h2>
        <div className="flex items-end gap-1.5 h-24">
          {REVENUE_BARS.map((bar) => (
            <div key={bar.day} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={cn('w-full rounded-t-sm transition-all', bar.today ? 'bg-[#0F766E]' : 'bg-slate-200')}
                style={{ height: `${(bar.value / 55) * 96}px` }}
              />
              <span className={cn('text-[8px] font-bold', bar.today ? 'text-[#0F766E]' : 'text-slate-400')}>{bar.day}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">Today: PKR 42,500 (highest this week)</p>
      </div>
    </div>

    {/* Pending Approvals */}
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="font-semibold text-slate-800 text-sm">Pending Approvals</h2>
        <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">2 items</span>
      </div>
      <div className="space-y-3">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-slate-800">Fee Waiver Request</p>
            <p className="text-xs text-slate-600 mt-0.5">User Name — PKR 2,000 waiver request</p>
            <p className="text-[10px] text-slate-400 mt-1">Reason: Financial hardship · Requested by Dr. Ahmad</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="flex items-center gap-1 bg-green-600 text-white rounded-lg px-2.5 py-1.5 text-[10px] font-bold hover:bg-green-700">
              <Check size={10} /> Approve
            </button>
            <button className="flex items-center gap-1 border border-red-200 text-red-600 rounded-lg px-2.5 py-1.5 text-[10px] font-bold hover:bg-red-50">
              <X size={10} /> Reject
            </button>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-slate-800">Appointment Override</p>
            <p className="text-xs text-slate-600 mt-0.5">Walk-in: Zainab Ali — urgent</p>
            <p className="text-[10px] text-slate-400 mt-1">No slot available — override requested</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="bg-[#0F766E] text-white rounded-lg px-2.5 py-1.5 text-[10px] font-bold hover:bg-[#0D6B63] whitespace-nowrap">Allow Override</button>
            <button className="border border-slate-200 text-slate-600 rounded-lg px-2.5 py-1.5 text-[10px] font-bold hover:bg-slate-50">Decline</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default GeneratedAppManagerDashboard;
