import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../../components/shared/Logo';
import { Avatar } from '../../components/ui/Avatar';
import { cn } from '../../utils/classNames';
import { motion } from 'framer-motion';
import {
  Bell, HelpCircle, Terminal, Package, Book, LifeBuoy,
  Copy, Search, CheckCircle2, Loader2, AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useProject } from '../../hooks/useProjects';
import { useLatestRun } from '../../hooks/useGeneration';
import type { GenerationLogLevel } from '../../types/generation.types';

type FilterLevel = 'All' | GenerationLogLevel;

const levelColors: Record<GenerationLogLevel, string> = {
  info: 'text-slate-400',
  success: 'text-green-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
};

const GenerationLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useAuthStore();
  const { data: project } = useProject(projectId);
  const { data: run, isLoading, isError } = useLatestRun(projectId);

  const [filter, setFilter] = useState<FilterLevel>('All');
  const [search, setSearch] = useState('');

  const logs = run?.logs ?? [];

  const filtered = useMemo(
    () =>
      logs.filter((log) => {
        const matchLevel = filter === 'All' || log.level === filter;
        const matchSearch = search === '' || log.message.toLowerCase().includes(search.toLowerCase());
        return matchLevel && matchSearch;
      }),
    [logs, filter, search]
  );

  const warnings = logs.filter((l) => l.level === 'warning' || l.level === 'error');

  const filterOptions: { label: string; value: FilterLevel }[] = [
    { label: 'All', value: 'All' },
    { label: 'Info', value: 'info' },
    { label: 'Success', value: 'success' },
    { label: 'Warning', value: 'warning' },
    { label: 'Error', value: 'error' },
  ];

  const copyAll = () => {
    navigator.clipboard.writeText(logs.map((l) => `[${l.level.toUpperCase()}] ${l.message}`).join('\n'));
  };

  const statusBadge = () => {
    if (!run) return null;
    if (run.status === 'completed')
      return <span className="flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full"><CheckCircle2 size={12} />COMPLETED</span>;
    if (run.status === 'failed')
      return <span className="flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full"><AlertTriangle size={12} />FAILED</span>;
    return <span className="flex items-center gap-1.5 bg-teal-100 text-teal-700 text-xs font-bold px-2.5 py-1 rounded-full"><Loader2 size={12} className="animate-spin" />{run.status.toUpperCase()}</span>;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <nav className="h-14 bg-[#134E4A] flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center space-x-6">
          <Logo size="sm" variant="light" useSecondary />
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span className="text-white/50">{project?.name || 'Project'}</span>
            <span className="text-white/30">›</span>
            <span className="text-white">Build Logs</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-white/70 hover:text-white"><Bell size={20} /></button>
          <button className="text-white/70 hover:text-white"><HelpCircle size={20} /></button>
          <Avatar name={user?.fullName || 'User'} size="sm" className="bg-[#34D399] text-[#134E4A]" />
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-48 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between p-4">
          <div className="space-y-1">
            <button
              onClick={() => navigate(`/project/${projectId}/generating`)}
              className="w-full flex items-center space-x-3 px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg text-sm font-medium transition-colors"
            >
              <Terminal size={16} /><span>Progress</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 bg-teal-50 text-[#0F766E] font-bold rounded-lg text-sm border-l-2 border-[#0F766E]">
              <Book size={16} /><span>Logs</span>
            </button>
            <button
              onClick={() => navigate(`/project/${projectId}/artifacts`)}
              className="w-full flex items-center space-x-3 px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg text-sm font-medium transition-colors"
            >
              <Package size={16} /><span>Artifacts</span>
            </button>
          </div>
          <div className="space-y-1 border-t border-slate-100 pt-4">
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-slate-400 hover:text-slate-600 rounded-lg text-sm transition-colors">
              <LifeBuoy size={14} /><span>Support</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 font-poppins">Build Logs — {project?.name || 'Project'}</h1>
                <div className="flex items-center gap-3 mt-2">
                  {statusBadge()}
                  {run?.stats?.files ? <span className="text-sm text-slate-500">{run.stats.files} files · {run.stats.endpoints} endpoints</span> : null}
                </div>
              </div>
              <button
                onClick={copyAll}
                className="flex items-center gap-2 h-9 px-4 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Copy size={14} />Copy All
              </button>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
                <Loader2 className="animate-spin" size={18} /> Loading logs…
              </div>
            )}
            {isError && !run && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                <AlertTriangle size={28} className="text-amber-500" />
                <p>No generation run found for this project yet.</p>
                <button onClick={() => navigate(`/project/${projectId}/generating`)} className="text-[#0F766E] font-semibold text-sm hover:underline">
                  Start a build →
                </button>
              </div>
            )}

            {run && (
              <>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="flex gap-1">
                    {filterOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setFilter(opt.value)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                          filter === opt.value ? 'bg-[#0F766E] text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search logs..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-8 pr-3 h-9 w-64 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
                    />
                  </div>
                </div>

                <div className="bg-[#0F172A] rounded-2xl overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between px-5 py-3 bg-[#0A1020] border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <span className="text-slate-300 text-xs font-bold uppercase tracking-widest ml-2">FLOWFORGE BUILD LOGS</span>
                    </div>
                    <span className="text-slate-600 text-xs font-mono">run {run.id.slice(-6)}</span>
                  </div>
                  <div className="font-mono text-xs p-6 max-h-[600px] overflow-y-auto space-y-0.5">
                    {filtered.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">No logs match the current filter.</p>
                    ) : (
                      filtered.map((log, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(i * 0.004, 0.4) }}
                          className="flex items-start gap-3 hover:bg-white/5 rounded px-2 py-0.5 -mx-2 transition-colors"
                        >
                          <span className="text-slate-600 shrink-0 w-16 tabular-nums">{log.time.slice(11, 19)}</span>
                          <span className={cn('shrink-0 w-16 font-bold', levelColors[log.level])}>[{log.level.toUpperCase()}]</span>
                          <span className={cn('flex-1 leading-relaxed', levelColors[log.level])}>{log.message}</span>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {warnings.length > 0 && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm mb-2">
                      <AlertTriangle size={16} />
                      {warnings.length} item{warnings.length > 1 ? 's' : ''} need attention
                    </div>
                    <ul className="space-y-1">
                      {warnings.map((w, i) => (
                        <li key={i} className="text-xs text-amber-800">• {w.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GenerationLogsPage;
