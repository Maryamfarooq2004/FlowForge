import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../../components/shared/Logo';
import { Avatar } from '../../components/ui/Avatar';
import { motion } from 'framer-motion';
import { cn } from '../../utils/classNames';
import {
  Bell, HelpCircle, Terminal, Package, Book, LifeBuoy,
  CheckCircle2, Box, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useProject } from '../../hooks/useProjects';
import { useLatestRun, useStartGeneration } from '../../hooks/useGeneration';
import type { ApiError } from '../../types/global.types';
import type { GenerationLogLevel } from '../../types/generation.types';

// The real backend pipeline stages (see server STAGES + finalize step).
const STEPS = [
  { id: 1, title: 'Database Schema Generated', sub: 'POSTGRESQL DDL' },
  { id: 2, title: 'ORM Models & Migrations Created', sub: 'SEQUELIZE + MIGRATIONS' },
  { id: 3, title: 'REST API Built', sub: 'CRUD · JWT · VALIDATION' },
  { id: 4, title: 'Workflow Endpoints Wired', sub: 'STATE MACHINE · ROLE GUARDS' },
  { id: 5, title: 'Business Rules & RBAC Injected', sub: 'GUARDS · ROLES CONFIG' },
  { id: 6, title: 'Deploy Bundle Created', sub: 'DOCKERFILE · RAILWAY/RENDER · LICENSE' },
];

const logColor: Record<GenerationLogLevel, string> = {
  info: 'text-slate-400',
  success: 'text-green-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
};

const GenerationProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useAuthStore();
  const { data: project } = useProject(projectId);

  const runQuery = useLatestRun(projectId);
  const start = useStartGeneration(projectId);
  const run = runQuery.data;

  const logsEndRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  // Auto-start a run the first time (404 = no run yet for this project).
  useEffect(() => {
    const status = (runQuery.error as ApiError | null)?.response?.status;
    if (runQuery.isError && status === 404 && !startedRef.current && !start.isPending) {
      startedRef.current = true;
      start.mutate();
    }
  }, [runQuery.isError, runQuery.error, start]);

  // On completion, move on to the browsable artifacts (Phase 3 payoff).
  useEffect(() => {
    if (run?.status === 'completed') {
      const t = setTimeout(() => navigate(`/project/${projectId}/artifacts`), 1400);
      return () => clearTimeout(t);
    }
  }, [run?.status, navigate, projectId]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [run?.logs?.length]);

  const handleRetry = () => {
    startedRef.current = true;
    start.mutate();
  };

  const percent = run?.percent ?? (start.isPending ? 1 : 0);
  const activeStep = run?.stage ?? 0;
  const failed = run?.status === 'failed';
  const logs = run?.logs ?? [];
  const domainLabel = project?.domain === 'school' ? 'school' : 'clinic';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Platform Navbar */}
      <nav className="h-14 bg-[#134E4A] flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center space-x-6">
          <Logo size="sm" variant="light" />
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span className="text-white">Generating Your App</span>
            <span className="text-white/50">{project?.name || 'Project'}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-white/70 hover:text-white"><Bell size={20} /></button>
          <button className="text-white/70 hover:text-white"><HelpCircle size={20} /></button>
          <Avatar name={user?.fullName || 'User'} size="sm" className="bg-[#34D399] text-[#134E4A]" />
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-48 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between p-4">
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-3 px-3 py-2 bg-slate-50 text-slate-800 rounded-lg text-sm font-medium">
              <Terminal size={18} className="text-slate-500" />
              <span>Progress</span>
            </button>
            <button
              onClick={() => run && navigate(`/project/${projectId}/logs`)}
              className="w-full flex items-center space-x-3 px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg text-sm font-medium transition-colors"
            >
              <Book size={18} />
              <span>Logs</span>
            </button>
            <button
              onClick={() => run?.status === 'completed' && navigate(`/project/${projectId}/artifacts`)}
              className="w-full flex items-center space-x-3 px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg text-sm font-medium transition-colors"
            >
              <Package size={18} />
              <span>Artifacts</span>
            </button>
          </div>
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-slate-400 hover:text-slate-600 rounded-lg text-sm transition-colors">
              <LifeBuoy size={16} />
              <span>Support</span>
            </button>
          </div>
        </aside>

        {/* Center Main Content */}
        <main className="flex-1 overflow-y-auto p-8 flex flex-col">
          <div className="max-w-2xl w-full mx-auto mt-4 mb-12">
            <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-sm relative overflow-hidden">
              {/* Top icon */}
              <div className={cn(
                'w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6',
                failed ? 'bg-red-50' : 'bg-teal-50'
              )}>
                {failed ? (
                  <AlertTriangle size={36} className="text-red-500" />
                ) : (
                  <motion.div
                    animate={{ rotateY: 360, rotateX: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  >
                    <Box size={36} className="text-[#0F766E]" />
                  </motion.div>
                )}
              </div>

              <h1 className="text-[24px] font-bold text-slate-900 font-poppins text-center mb-2">
                {failed
                  ? 'Generation failed'
                  : run?.status === 'completed'
                    ? 'Your backend is ready!'
                    : `Building your ${domainLabel} backend...`}
              </h1>
              <p className="text-slate-500 text-center mb-10 text-sm">
                {failed
                  ? (run?.error || 'Something went wrong during generation.')
                  : run?.status === 'completed'
                    ? 'Redirecting you to the generated files…'
                    : 'Real Node/Express + PostgreSQL code is being generated from your blueprint.'}
              </p>

              {failed && (
                <div className="flex justify-center mb-8">
                  <button
                    onClick={handleRetry}
                    disabled={start.isPending}
                    className="flex items-center gap-2 h-11 px-6 bg-[#0F766E] hover:bg-[#0D6B63] text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={16} /> Try again
                  </button>
                </div>
              )}

              {/* Progress */}
              <div className="mb-10">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">SYSTEM READINESS</span>
                  <span className="text-2xl font-bold text-[#0F766E]">{percent}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative">
                  <motion.div
                    className={cn('h-full relative', failed ? 'bg-red-400' : 'bg-gradient-to-r from-[#0F766E] to-[#4F46E5]')}
                    animate={{ width: `${percent}%` }}
                    transition={{ ease: 'linear', duration: 0.6 }}
                  >
                    {!failed && (
                      <motion.div
                        className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      />
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Pipeline steps */}
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {STEPS.map((step) => {
                  const isCompleted = activeStep > step.id || run?.status === 'completed';
                  const isActive = !failed && activeStep === step.id && run?.status !== 'completed';
                  const isQueued = activeStep < step.id;
                  return (
                    <div key={step.id} className="relative flex items-center justify-between group">
                      <div className="flex items-center space-x-4 w-full">
                        <div className="relative z-10 w-6 h-6 flex items-center justify-center bg-white">
                          {isCompleted && <CheckCircle2 size={24} className="text-[#0F766E]" />}
                          {isActive && (
                            <div className="w-4 h-4 bg-teal-500 rounded-full relative">
                              <div className="absolute inset-0 bg-teal-400 rounded-full animate-ping opacity-75" />
                            </div>
                          )}
                          {isQueued && !isCompleted && <div className="w-4 h-4 border-2 border-slate-200 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className={cn('font-semibold text-sm transition-colors', isCompleted ? 'text-slate-800' : isActive ? 'text-[#0F766E]' : 'text-slate-400')}>
                            {step.title}
                          </p>
                          <p className={cn('text-[10px] font-bold uppercase tracking-widest mt-0.5', isCompleted ? 'text-slate-400' : isActive ? 'text-teal-600' : 'text-slate-300')}>
                            {step.sub}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live logs */}
              <div className="mt-12 bg-[#1E2A3A] rounded-xl overflow-hidden shadow-inner border border-slate-800">
                <div className="w-full flex items-center justify-between px-4 py-3 bg-[#17202C] border-b border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-2">BUILD LOGS</span>
                  </div>
                </div>
                <div className="p-4 h-52 overflow-y-auto font-mono text-xs">
                  {logs.length === 0 && <div className="text-slate-500">&gt; Waiting for the build to start…</div>}
                  {logs.map((log, index) => (
                    <div key={index} className="flex mb-1">
                      <span className="text-slate-600 mr-2 select-none">&gt;</span>
                      <span className={cn('leading-relaxed', logColor[log.level])}>{log.message}</span>
                    </div>
                  ))}
                  {run && run.status !== 'completed' && !failed && (
                    <div className="flex mt-1 items-center">
                      <span className="text-teal-400 font-bold mr-2">&gt;</span>
                      <span className="w-2 h-3 bg-slate-400 animate-pulse inline-block" />
                    </div>
                  )}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-col items-center justify-center pb-6">
            <Logo size="sm" variant="dark" />
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-3">FLOWFORGE CODE GENERATION PIPELINE</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GenerationProgressPage;
