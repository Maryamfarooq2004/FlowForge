import React, { useState } from 'react';
import { Search, SlidersHorizontal, Plus, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { cn } from '../../../utils/classNames';

interface Patient {
  id: string;
  initials: string;
  name: string;
  genderAge: string;
  phone: string;
  lastVisit: string;
  diagnosis: string;
  status: 'ACTIVE' | 'FOLLOW-UP' | 'INACTIVE';
}

const PATIENTS: Patient[] = [
  { id: '1', initials: 'AK', name: 'User Name', genderAge: 'M / 35', phone: '+92 300 1234567', lastVisit: '8 May 2026', diagnosis: 'Hypertension', status: 'ACTIVE' },
  { id: '2', initials: 'FM', name: 'Fatima Malik', genderAge: 'F / 28', phone: '+92 311 9876543', lastVisit: '5 May 2026', diagnosis: 'Diabetes Type II', status: 'ACTIVE' },
  { id: '3', initials: 'OR', name: 'Omar Riaz', genderAge: 'M / 45', phone: '+92 321 5555555', lastVisit: '1 Apr 2026', diagnosis: 'Follow-up Due ⚠️', status: 'FOLLOW-UP' },
  { id: '4', initials: 'ZA', name: 'Zainab Ali', genderAge: 'F / 22', phone: '+92 333 7777777', lastVisit: '12 Mar 2026', diagnosis: 'Routine Check', status: 'INACTIVE' },
];

const statusConfig = {
  'ACTIVE': { cls: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  'FOLLOW-UP': { cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500 animate-pulse' },
  'INACTIVE': { cls: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
};

interface GeneratedAppPatientsListProps {
  onViewPatient?: () => void;
  onNewPatient?: () => void;
}

export const GeneratedAppPatientsList: React.FC<GeneratedAppPatientsListProps> = ({ onViewPatient, onNewPatient }) => {
  const [search, setSearch] = useState('');
  const filtered = PATIENTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 font-poppins">Patients</h1>
          <p className="text-xs text-slate-500">All registered patients and records</p>
        </div>
        <button
          onClick={onNewPatient}
          className="flex items-center gap-1.5 bg-[#0F766E] text-white rounded-lg px-3 py-2 text-xs font-bold hover:bg-[#0D6B63] transition-colors"
        >
          <Plus size={14} />
          New Patient
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 h-8 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
          />
        </div>
        <button className="flex items-center gap-1.5 h-8 px-3 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50">
          <SlidersHorizontal size={13} />
          Filter
        </button>
        <select className="h-8 px-2 border border-slate-200 rounded-lg text-xs text-slate-600 bg-white focus:outline-none">
          <option>Last Visit ▾</option>
          <option>Name A-Z</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto">156 patients</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Contact</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Visit</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden md:table-cell">Diagnosis</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((p) => {
              const sc = statusConfig[p.status];
              return (
                <tr key={p.id} className="hover:bg-teal-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0',
                        p.status === 'INACTIVE' ? 'bg-slate-100 text-slate-500' : 'bg-teal-100 text-teal-700'
                      )}>
                        {p.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.genderAge}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{p.phone}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{p.lastVisit}</td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{p.diagnosis}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={cn('w-1.5 h-1.5 rounded-full', sc.dot)} />
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', sc.cls)}>{p.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={onViewPatient} className="bg-[#0F766E] text-white rounded-md px-2.5 py-1 text-[10px] font-bold hover:bg-[#0D6B63]">View</button>
                      {p.status === 'FOLLOW-UP' ? (
                        <button className="border border-slate-200 text-slate-600 rounded-md px-2.5 py-1 text-[10px] font-semibold hover:bg-slate-50 flex items-center gap-1">
                          <Phone size={10} /> Call
                        </button>
                      ) : p.status === 'ACTIVE' ? (
                        <button className="border border-slate-200 text-slate-600 rounded-md px-2.5 py-1 text-[10px] font-semibold hover:bg-slate-50">Book</button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
          <span className="text-[10px] text-slate-400">Showing 1–10 of 156 patients</span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-white"><ChevronLeft size={14} /></button>
            <button className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0F766E] text-white">1</button>
            <button className="px-2.5 py-1 rounded-lg text-xs text-slate-600 hover:bg-white border border-slate-200">2</button>
            <button className="px-2.5 py-1 rounded-lg text-xs text-slate-600 hover:bg-white border border-slate-200">3</button>
            <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-white"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedAppPatientsList;
