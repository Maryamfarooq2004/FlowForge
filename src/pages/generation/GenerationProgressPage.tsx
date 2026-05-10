import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../../components/shared/Logo';
import { Avatar } from '../../components/ui/Avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/classNames';
import { 
  Bell, 
  HelpCircle,
  Terminal,
  Package,
  Book,
  LifeBuoy,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Box
} from 'lucide-react';

const mockLogs = [
  "> Validating WorkflowSpec...",
  "> WorkflowSpec Validated ✅",
  "> Analyzing entities and relationships...",
  "> Creating migration: create_patients_table... ✅",
  "> Creating migration: create_appointments_table... ✅",
  "> Generating Sequelize models...",
  "> Models generated successfully ✅",
  "> Building route: POST /api/appointments... ✅",
  "> Building route: GET /api/patients... ✅",
  "> Building route: PUT /api/appointments/:id/confirm... 🔵",
  "> Compiling REST controllers...",
  "> Enforcing business rules in service layer...",
  "> Generating React components for patient intake...",
  "> Generating Dashboard layout...",
  "> Connecting frontend to API...",
  "> Bundling assets...",
  "> Preparing preview deployment..."
];

const stepsConfig = [
  { id: 1, title: 'WorkflowSpec Approved & Validated', subLabel: 'VALIDATION COMPLETE', timer: '0:12', logsIndex: 2 },
  { id: 2, title: 'PostgreSQL Schema Generated (5 tables, 31 fields)', subLabel: 'DATABASE ARCHITECTURE LOCKED', timer: '0:34', pills: ['patients', 'appointments...'], logsIndex: 5 },
  { id: 3, title: 'Sequelize ORM Models & Migrations Created', subLabel: 'OBJECT MAPPING FINALIZED', timer: '0:51', logsIndex: 7 },
  { id: 4, title: 'CRUD & Workflow REST APIs Building...', subLabel: 'COMPILING CONTROLLERS', timer: '~1:20 remaining', pills: ['42 endpoints created'], logsIndex: 11 },
  { id: 5, title: 'Business Rules Enforced in Backend', subLabel: 'QUEUED', timer: '', logsIndex: 12 },
  { id: 6, title: 'React Frontend Screens Generating', subLabel: 'QUEUED', timer: '', logsIndex: 15 },
  { id: 7, title: 'Deploying Preview Environment', subLabel: 'QUEUED', timer: '', logsIndex: 17 },
];

const GenerationProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(1);
  const [logs, setLogs] = useState<string[]>(['> Initializing build pipeline...']);
  const [isLogsOpen, setIsLogsOpen] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Simulated polling
  useEffect(() => {
    let currentLogIndex = 0;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 2;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            navigate(`/project/${projectId || 'new'}/preview`);
          }, 1500);
          return 100;
        }
        return next;
      });

      // Update active step based on progress
      if (progress > 10) setActiveStep(2);
      if (progress > 25) setActiveStep(3);
      if (progress > 40) setActiveStep(4);
      if (progress > 60) setActiveStep(5);
      if (progress > 75) setActiveStep(6);
      if (progress > 90) setActiveStep(7);

      // Add logs
      if (currentLogIndex < mockLogs.length && Math.random() > 0.3) {
        setLogs(prev => [...prev, mockLogs[currentLogIndex]]);
        currentLogIndex++;
      }
    }, 800);

    return () => clearInterval(interval);
  }, [progress, navigate, projectId]);

  // Auto-scroll logs
  useEffect(() => {
    if (isLogsOpen && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isLogsOpen]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Platform Navbar */}
      <nav className="h-14 bg-[#134E4A] flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center space-x-6">
          <Logo size="sm" variant="light" />
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span className="text-white">Generating Your App</span>
            <span className="text-white/50">Al-Shifa Clinic</span>
            <span className="text-white/50">›</span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <button className="text-sm font-bold text-white border-b-2 border-white pb-1 mt-1">Workflows</button>
          <button className="text-sm font-bold text-white/40 hover:text-white/70 transition-colors pb-1 mt-1 border-b-2 border-transparent">Dashboard</button>
          <button className="text-sm font-bold text-white/40 hover:text-white/70 transition-colors pb-1 mt-1 border-b-2 border-transparent">Settings</button>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-white/70 hover:text-white">
            <Bell size={20} />
          </button>
          <button className="text-white/70 hover:text-white">
            <HelpCircle size={20} />
          </button>
          <Avatar name="Maryam Farooq" size="sm" className="bg-[#34D399] text-[#134E4A]" />
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-48 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between p-4">
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-3 px-3 py-2 bg-slate-50 text-slate-800 rounded-lg text-sm font-medium">
              <Terminal size={18} className="text-slate-500" />
              <span>Logs</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg text-sm font-medium transition-colors">
              <Package size={18} />
              <span>Artifacts</span>
            </button>
          </div>
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-slate-400 hover:text-slate-600 rounded-lg text-sm transition-colors">
              <Book size={16} />
              <span>Docs</span>
            </button>
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
              {/* Top rotating icon */}
              <div className="w-20 h-20 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <motion.div
                  animate={{ rotateY: 360, rotateX: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Box size={36} className="text-[#0F766E]" />
                </motion.div>
              </div>

              <h1 className="text-[24px] font-bold text-slate-900 font-poppins text-center mb-2">Building your clinic application...</h1>
              <p className="text-slate-500 text-center mb-10 text-sm">Estimated time: ~6 minutes. Do not close this tab.</p>

              {/* System Readiness Progress */}
              <div className="mb-10">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">SYSTEM READINESS</span>
                  <span className="text-2xl font-bold text-[#0F766E]">{progress}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[#0F766E] to-[#4F46E5] relative"
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear", duration: 0.8 }}
                  >
                    {/* Shimmer effect */}
                    <motion.div 
                      className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                </div>
              </div>

              {/* Pipeline Steps List */}
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {stepsConfig.map((step) => {
                  const isCompleted = activeStep > step.id;
                  const isActive = activeStep === step.id;
                  const isQueued = activeStep < step.id;

                  return (
                    <div key={step.id} className="relative flex items-center justify-between group">
                      <div className="flex items-center space-x-4 w-2/3">
                        {/* Status Icon */}
                        <div className="relative z-10 w-6 h-6 flex items-center justify-center bg-white">
                          {isCompleted && <CheckCircle2 size={24} className="text-[#0F766E]" />}
                          {isActive && (
                            <div className="w-4 h-4 bg-teal-500 rounded-full relative">
                              <div className="absolute inset-0 bg-teal-400 rounded-full animate-ping opacity-75"></div>
                            </div>
                          )}
                          {isQueued && <div className="w-4 h-4 border-2 border-slate-200 rounded-full bg-white"></div>}
                        </div>
                        
                        {/* Step Text */}
                        <div>
                          <p className={cn(
                            "font-semibold text-sm transition-colors",
                            isCompleted ? "text-slate-800" : isActive ? "text-[#0F766E]" : "text-slate-400"
                          )}>
                            {step.title}
                          </p>
                          <p className={cn(
                            "text-[10px] font-bold uppercase tracking-widest mt-0.5",
                            isCompleted ? "text-slate-400" : isActive ? "text-teal-600" : "text-slate-300"
                          )}>
                            {step.subLabel}
                          </p>
                        </div>
                      </div>

                      {/* Right Details */}
                      <div className="flex items-center space-x-3 w-1/3 justify-end">
                        {step.pills && step.pills.map((pill, i) => (
                          <span key={i} className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold hidden sm:inline-block",
                            isActive ? "bg-teal-50 text-teal-700 border border-teal-100" : "bg-slate-100 text-slate-500 border border-slate-200"
                          )}>
                            {pill}
                          </span>
                        ))}
                        {step.timer && (
                          <span className={cn(
                            "text-xs font-mono",
                            isActive ? "text-teal-600" : "text-slate-400"
                          )}>
                            {step.timer}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Build Logs Console */}
              <div className="mt-12 bg-[#1E2A3A] rounded-xl overflow-hidden shadow-inner border border-slate-800">
                <button 
                  onClick={() => setIsLogsOpen(!isLogsOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#17202C] hover:bg-[#1C2633] transition-colors border-b border-slate-700/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-2">BUILD LOGS</span>
                  </div>
                  {isLogsOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>
                
                <AnimatePresence>
                  {isLogsOpen && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: 200 }}
                      exit={{ height: 0 }}
                      className="p-4 overflow-y-auto font-mono text-xs"
                    >
                      {logs.map((log, index) => (
                        <div key={index} className="flex mb-1">
                          <span className={cn(
                            "mr-2 select-none",
                            log.includes('✅') ? "text-green-400" : 
                            log.includes('🔵') ? "text-blue-400" : "text-slate-500"
                          )}>
                            {log.includes('>') ? '' : '> '}
                          </span>
                          <span className={cn(
                            log.includes('✅') ? "text-slate-300" : 
                            log.includes('🔵') ? "text-white font-medium" : "text-slate-400"
                          )}>
                            {log.replace('>', '').trim()}
                            {log.includes('🔵') && (
                              <span className="inline-block ml-2 animate-spin w-2 h-2 border-2 border-t-blue-400 border-blue-400/20 rounded-full"></span>
                            )}
                          </span>
                        </div>
                      ))}
                      <div className="flex mt-1 items-center">
                        <span className="text-teal-400 font-bold mr-2">{'>'}</span>
                        <span className="w-2 h-3 bg-slate-400 animate-pulse inline-block"></span>
                      </div>
                      <div ref={logsEndRef} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

          <div className="mt-auto flex flex-col items-center justify-center pb-6">
            <Logo size="sm" variant="dark" />
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-3">HIGH-END EDITORIAL PIPELINE SYSTEM V2.4</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GenerationProgressPage;
