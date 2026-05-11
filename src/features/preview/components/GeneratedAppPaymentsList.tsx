import React from 'react';
import { DollarSign, CreditCard, Landmark, Plus, FileText, Phone } from 'lucide-react';
import { cn } from '../../../utils/classNames';

const StatCard: React.FC<{ label: string; value: string; sub?: React.ReactNode; color?: string }> = ({ label, value, sub, color }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex-1">
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
    <p className={cn('text-xl font-bold font-poppins', color || 'text-slate-900')}>{value}</p>
    {sub && <div className="text-xs mt-0.5">{sub}</div>}
  </div>
);

interface Payment {
  patient: string;
  initials: string;
  date: string;
  amount: string;
  method: string | null;
  status: 'PAID' | 'PENDING' | 'PROCESSING' | 'OVERDUE';
}

const PAYMENTS: Payment[] = [
  { patient: 'User Name', initials: 'AK', date: '8 May 2026', amount: 'PKR 1,500', method: 'Cash', status: 'PAID' },
  { patient: 'Fatima Malik', initials: 'FM', date: '8 May 2026', amount: 'PKR 3,000', method: 'Credit Card', status: 'PAID' },
  { patient: 'Omar Riaz', initials: 'OR', date: '1 May 2026', amount: 'PKR 2,500', method: null, status: 'PENDING' },
  { patient: 'Zainab Ali', initials: 'ZA', date: '15 Apr 2026', amount: 'PKR 5,900', method: 'Insurance', status: 'PROCESSING' },
];

const statusConfig = {
  PAID: 'bg-green-100 text-green-700',
  PENDING: 'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  OVERDUE: 'bg-red-100 text-red-700',
};

export const GeneratedAppPaymentsList: React.FC = () => (
  <div className="p-5 space-y-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-slate-900 font-poppins">Payments</h1>
        <p className="text-xs text-slate-500">Track and manage patient payments</p>
      </div>
      <button className="flex items-center gap-1.5 bg-[#0F766E] text-white rounded-lg px-3 py-2 text-xs font-bold hover:bg-[#0D6B63] transition-colors">
        <Plus size={14} />
        Record Payment
      </button>
    </div>

    {/* Summary strip */}
    <div className="flex gap-3">
      <StatCard
        label="Total Collected Today"
        value="PKR 34,100"
        color="text-green-700"
        sub={<span className="text-green-600 font-semibold">↑ 8% from yesterday</span>}
      />
      <StatCard
        label="Outstanding Payments"
        value="PKR 8,400"
        color="text-amber-600"
        sub={<span className="text-amber-600 font-semibold">3 patients</span>}
      />
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Split by Method</p>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <DollarSign size={12} className="text-green-500" />
            <span className="text-slate-500">Cash:</span>
            <span className="font-bold text-slate-800">PKR 22,000</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CreditCard size={12} className="text-blue-500" />
            <span className="text-slate-500">Card:</span>
            <span className="font-bold text-slate-800">PKR 12,100</span>
          </div>
        </div>
      </div>
    </div>

    {/* Table */}
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {['Patient', 'Date', 'Amount', 'Method', 'Status', 'Invoice', 'Actions'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {PAYMENTS.map((p, i) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-bold shrink-0">{p.initials}</div>
                  <span className="font-semibold text-slate-800 whitespace-nowrap">{p.patient}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{p.date}</td>
              <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">{p.amount}</td>
              <td className="px-4 py-3 text-slate-500">
                {p.method ? (
                  <div className="flex items-center gap-1">
                    {p.method === 'Cash' && <DollarSign size={11} className="text-green-500" />}
                    {p.method === 'Credit Card' && <CreditCard size={11} className="text-blue-500" />}
                    {p.method === 'Insurance' && <Landmark size={11} className="text-purple-500" />}
                    {p.method}
                  </div>
                ) : <span className="text-slate-300">—</span>}
              </td>
              <td className="px-4 py-3">
                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', statusConfig[p.status])}>
                  {p.status}
                </span>
              </td>
              <td className="px-4 py-3">
                {p.status === 'PAID' && (
                  <button className="flex items-center gap-1 text-[#0F766E] hover:underline text-[10px] font-semibold">
                    <FileText size={11} /> Invoice
                  </button>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  {p.status === 'PENDING' && (
                    <>
                      <button className="bg-[#0F766E] text-white rounded-md px-2 py-1 text-[10px] font-bold hover:bg-[#0D6B63] whitespace-nowrap">Record</button>
                      <button className="border border-slate-200 text-slate-600 rounded-md px-2 py-1 text-[10px] font-semibold hover:bg-slate-50 flex items-center gap-1">
                        <Phone size={10} /> Remind
                      </button>
                    </>
                  )}
                  {p.status === 'PROCESSING' && (
                    <button className="border border-slate-200 text-slate-600 rounded-md px-2 py-1 text-[10px] font-semibold hover:bg-slate-50 whitespace-nowrap">Details</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default GeneratedAppPaymentsList;
