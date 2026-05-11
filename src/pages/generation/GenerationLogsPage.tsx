import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../../components/shared/Logo';
import { Avatar } from '../../components/ui/Avatar';
import { cn } from '../../utils/classNames';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, HelpCircle, Terminal, Package, Book, LifeBuoy,
  Download, Copy, Search, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2
} from 'lucide-react';

type LogLevel = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

interface LogEntry {
  level: LogLevel;
  time: string;
  message: string;
}

const RAW_LOGS: LogEntry[] = [
  { level: 'INFO', time: '11:34:12', message: 'Build initiated for project proj_001' },
  { level: 'INFO', time: '11:34:13', message: 'WorkflowSpec v3 loaded — 4 entities, 3 roles, 2 workflow states' },
  { level: 'SUCCESS', time: '11:34:15', message: 'Schema generation started' },
  { level: 'INFO', time: '11:34:16', message: 'Creating table: patients (id, full_name, phone, age, medical_history, created_at)' },
  { level: 'INFO', time: '11:34:16', message: 'Creating table: appointments (id, patient_id FK, doctor_id FK, date, time, status)' },
  { level: 'INFO', time: '11:34:17', message: 'Creating table: prescriptions (id, appointment_id FK, medication, dosage, approved_by)' },
  { level: 'INFO', time: '11:34:17', message: 'Creating table: payments (id, appointment_id FK, amount, method, status)' },
  { level: 'SUCCESS', time: '11:34:18', message: 'Schema generation complete (4 tables, 31 fields, 6 FK constraints)' },
  { level: 'INFO', time: '11:34:18', message: 'Generating Sequelize ORM models...' },
  { level: 'SUCCESS', time: '11:34:21', message: 'ORM models generated (Patient, Appointment, Prescription, Payment)' },
  { level: 'INFO', time: '11:34:21', message: 'Generating migration scripts (sequential, idempotent)...' },
  { level: 'SUCCESS', time: '11:34:23', message: '4 migration files created' },
  { level: 'INFO', time: '11:34:23', message: 'Generating CRUD REST API endpoints...' },
  { level: 'INFO', time: '11:34:24', message: 'POST /api/patients — created' },
  { level: 'INFO', time: '11:34:24', message: 'GET /api/patients — created' },
  { level: 'INFO', time: '11:34:25', message: 'PUT /api/patients/:id — created' },
  { level: 'INFO', time: '11:34:26', message: 'DELETE /api/patients/:id — created' },
  { level: 'INFO', time: '11:34:30', message: 'POST /api/appointments — created' },
  { level: 'INFO', time: '11:34:31', message: 'GET /api/appointments — created' },
  { level: 'INFO', time: '11:34:32', message: 'PUT /api/appointments/:id/confirm — created' },
  { level: 'INFO', time: '11:34:40', message: 'GET /api/payments — created' },
  { level: 'SUCCESS', time: '11:35:10', message: '42 API endpoints generated with JWT middleware' },
  { level: 'INFO', time: '11:35:10', message: 'Injecting business rules...' },
  { level: 'WARNING', time: '11:35:11', message: 'Rule R3: "VIP priority queue" — pattern ambiguous, TODO added to service layer' },
  { level: 'SUCCESS', time: '11:35:13', message: '4 business rules injected (1 TODO flagged)' },
  { level: 'INFO', time: '11:35:13', message: 'Generating React frontend (Clinic theme: Clinical Blue)...' },
  { level: 'INFO', time: '11:35:14', message: 'Generating Dashboard — Receptionist role' },
  { level: 'INFO', time: '11:35:18', message: 'Generating Dashboard — Doctor role' },
  { level: 'INFO', time: '11:35:22', message: 'Generating Dashboard — Manager role' },
  { level: 'INFO', time: '11:35:26', message: 'Generating Appointments list screen' },
  { level: 'INFO', time: '11:35:30', message: 'Generating Patients list and detail screens' },
  { level: 'INFO', time: '11:35:38', message: 'Generating Payments screen' },
  { level: 'INFO', time: '11:35:46', message: 'Generating Notifications screen' },
  { level: 'SUCCESS', time: '11:38:45', message: 'Frontend generated (18 screens, 47 components)' },
  { level: 'INFO', time: '11:38:46', message: 'Bundling deployment package...' },
  { level: 'SUCCESS', time: '11:38:55', message: 'Build complete. Deploying to staging...' },
  { level: 'SUCCESS', time: '11:42:03', message: 'Staging deployment live: alshifa.preview.flowforge.app ✓' },
];

const levelColors: Record<LogLevel, string> = {
  INFO: 'text-slate-400',
  SUCCESS: 'text-green-400',
  WARNING: 'text-amber-400',
  ERROR: 'text-red-400',
};

const levelBadge: Record<LogLevel, string> = {
  INFO: 'text-slate-500',
  SUCCESS: 'text-green-400 font-bold',
  WARNING: 'text-amber-400 font-bold',
  ERROR: 'text-red-400 font-bold',
};

type FilterLevel = 'All' | LogLevel;

const colorizeMessage = (msg: string): React.ReactNode => {
  // Highlight /api/... paths in blue, table names in teal
  return msg.split(/(\b\/api\/[^\s]+|\bPOST\b|\bGET\b|\bPUT\b|\bDELETE\b|patients|appointments|prescriptions|payments)/g).map((part, i) => {
    if (/^\/(api)/.test(part)) return <span key={i} className="text-blue-400">{part}</span>;
    if (/^(POST|GET|PUT|DELETE)$/.test(part)) return <span key={i} className="text-purple-400">{part}</span>;
    if (/^(patients|appointments|prescriptions|payments)$/.test(part)) return <span key={i} className="text-teal-300">{part}</span>;
    return part;
  });
};

const GenerationLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [filter, setFilter] = useState<FilterLevel>('All');
  const [search, setSearch] = useState('');
  const [warningOpen, setWarningOpen] = useState(true);
  const logBodyRef = useRef<HTMLDivElement>(null);

  const filtered = RAW_LOGS.filter(log => {
    const matchLevel = filter === 'All' || log.level === filter;
    const matchSearch = search === '' || log.message.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  const warnings = RAW_LOGS.filter(l => l.level === 'WARNING');

  const filterOptions: { label: string; value: FilterLevel; emoji: string }[] = [
    { label: 'All', value: 'All', emoji: '' },
    { label: 'Info', value: 'INFO', emoji: 'ℹ️' },
    { label: 'Success', value: 'SUCCESS', emoji: '✓' },
    { label: 'Warning', value: 'WARNING', emoji: '⚠️' },
    { label: 'Error', value: 'ERROR', emoji: '✗' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Platform Navbar */}
      <nav className="h-14 bg-[#134E4A] flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center space-x-6">
          <Logo size="sm" variant="light" useSecondary={true} />
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span className="text-white/50">My Organization</span>
            <span className="text-white/30">›</span>
            <span className="text-white">Build Logs</span>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <button className="text-sm font-bold text-white/40 hover:text-white/70 transition-colors pb-1 mt-1 border-b-2 border-transparent"
            onClick={() => navigate(`/project/${projectId || 'new'}/alerts`)}>Workflows</button>
          <button className="text-sm font-bold text-white/40 hover:text-white/70 transition-colors pb-1 mt-1 border-b-2 border-transparent">Dashboard</button>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-white/70 hover:text-white"><Bell size={20} /></button>
          <button className="text-white/70 hover:text-white"><HelpCircle size={20} /></button>
          <Avatar name="Maryam Farooq" size="sm" className="bg-[#34D399] text-[#134E4A]" />
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-48 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between p-4">
          <div className="space-y-1">
            <button
              className="w-full flex items-center space-x-3 px-3 py-2 bg-teal-50 text-[#0F766E] font-bold rounded-lg text-sm border-l-2 border-[#0F766E]"
              onClick={() => navigate(`/project/${projectId || 'new'}/logs`)}
            >
              <Terminal size={16} />
              <span>Logs</span>
            </button>
            <button
              className="w-full flex items-center space-x-3 px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg text-sm font-medium transition-colors"
              onClick={() => navigate(`/project/${projectId || 'new'}/artifacts`)}
            >
              <Package size={16} />
              <span>Artifacts</span>
            </button>
          </div>
          <div className="space-y-1 border-t border-slate-100 pt-4">
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-slate-400 hover:text-slate-600 rounded-lg text-sm transition-colors">
              <Book size={14} /><span>Docs</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-slate-400 hover:text-slate-600 rounded-lg text-sm transition-colors">
              <LifeBuoy size={14} /><span>Support</span>
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 font-poppins">Build Logs — My Organization</h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={12} />COMPLETED
                  </span>
                  <span className="text-sm text-slate-500">Generated May 8, 2026 at 11:42 AM</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 h-9 px-4 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  <Download size={14} />Download Logs
                </button>
                <button className="flex items-center gap-2 h-9 px-4 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  <Copy size={14} />Copy All
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex gap-1">
                {filterOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFilter(opt.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                      filter === opt.value
                        ? 'bg-[#0F766E] text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {opt.emoji && <span className="mr-1">{opt.emoji}</span>}{opt.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-3 h-9 w-64 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
                />
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <ChevronDown size={14} className="text-slate-400" />
                <span className="text-sm text-slate-500">Last run</span>
              </div>
            </div>

            {/* Terminal Window */}
            <div className="bg-[#0F172A] rounded-2xl overflow-hidden shadow-2xl">
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-5 py-3 bg-[#0A1020] border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-slate-300 text-xs font-bold uppercase tracking-widest ml-2">FLOWFORGE BUILD LOGS</span>
                </div>
                <span className="text-slate-600 text-xs font-mono">v2.4.1</span>
              </div>

              {/* Log Body */}
              <div
                ref={logBodyRef}
                className="font-mono text-xs p-6 max-h-[600px] overflow-y-auto space-y-0.5 scrollbar-thin"
              >
                {filtered.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No logs match the current filter.</p>
                ) : (
                  filtered.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.005 }}
                      className="flex items-start gap-3 group hover:bg-white/5 rounded px-2 py-0.5 -mx-2 transition-colors"
                    >
                      <span className="text-slate-600 shrink-0 w-14 tabular-nums">{log.time}</span>
                      <span className={cn('shrink-0 w-16', levelBadge[log.level])}>
                        [{log.level}]
                      </span>
                      <span className={cn('flex-1 leading-relaxed', levelColors[log.level])}>
                        {colorizeMessage(log.message)}
                      </span>
                    </motion.div>
                  ))
                )}
                {/* cursor */}
                <div className="flex items-center gap-1 mt-2 pl-2">
                  <span className="text-teal-400 font-bold">›</span>
                  <span className="w-2 h-3.5 bg-slate-400 animate-pulse inline-block rounded-sm" />
                </div>
              </div>
            </div>

            {/* Warning Details Panel */}
            {warnings.length > 0 && (
              <div className="mt-4 bg-amber-950 border border-amber-700/50 rounded-xl overflow-hidden">
                <button
                  onClick={() => setWarningOpen(p => !p)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-amber-900/30 transition-colors"
                >
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                    <AlertTriangle size={16} />
                    ⚠ {warnings.length} warning{warnings.length > 1 ? 's' : ''} flagged during build
                  </div>
                  {warningOpen
                    ? <ChevronUp size={16} className="text-amber-600" />
                    : <ChevronDown size={16} className="text-amber-600" />
                  }
                </button>
                <AnimatePresence>
                  {warningOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-2 space-y-3">
                        <div className="bg-amber-900/30 border border-amber-700/40 rounded-lg p-4">
                          <p className="text-xs font-bold text-amber-300 mb-1">Rule: R3 — "VIP priority queue"</p>
                          <p className="text-xs text-amber-400/80 leading-relaxed mb-2">
                            Issue: Pattern too ambiguous to auto-implement. A TODO comment has been added to <span className="font-mono text-amber-300">appointments.service.ts</span>
                          </p>
                          <p className="text-xs text-amber-500/60 leading-relaxed">
                            Resolution: Edit the exported source code to implement this rule manually, or re-define it in the WorkflowSpec.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GenerationLogsPage;
