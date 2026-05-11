import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../../components/shared/Logo';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/classNames';
import {
  ExternalLink,
  ChevronDown,
  Lock,
  RotateCw,
  Sparkles,
  Send,
} from 'lucide-react';
import { GeneratedAppLogin } from '../../features/preview/components/GeneratedAppLogin';
import { GeneratedAppShell } from '../../features/preview/components/GeneratedAppShell';
import type { AppScreen, AppRole } from '../../features/preview/components/GeneratedAppShell';
import { GeneratedAppDoctorDashboard } from '../../features/preview/components/GeneratedAppDoctorDashboard';
import { GeneratedAppManagerDashboard } from '../../features/preview/components/GeneratedAppManagerDashboard';
import { GeneratedAppPatientsList } from '../../features/preview/components/GeneratedAppPatientsList';
import { GeneratedAppPatientDetail } from '../../features/preview/components/GeneratedAppPatientDetail';
import { GeneratedAppNewPatientForm } from '../../features/preview/components/GeneratedAppNewPatientForm';
import { GeneratedAppPaymentsList } from '../../features/preview/components/GeneratedAppPaymentsList';
import { GeneratedAppNotifications } from '../../features/preview/components/GeneratedAppNotifications';

const AppPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [activeRole, setActiveRole] = useState<AppRole>('Receptionist');
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'user', text: 'Rename the Patient Name column to Full Name' },
    { id: 2, sender: 'ai', text: 'Done ✅ — Column renamed to **Full Name** on the Appointments list screen. Preview updated.', timestamp: 'regenerated in 34s' },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState<'login' | 'app'>('login');
  const [appScreen, setAppScreen] = useState<AppScreen>('dashboard-receptionist');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleRoleChange = (role: AppRole) => {
    setActiveRole(role);
    setRoleMenuOpen(false);
    const screenMap: Record<AppRole, AppScreen> = {
      Receptionist: 'dashboard-receptionist',
      Doctor: 'dashboard-doctor',
      Manager: 'dashboard-manager',
    };
    setAppScreen(screenMap[role]);
  };

  const handleDeploy = () => {
    navigate(`/project/${projectId || 'new'}/deploy`);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isGenerating) return;

    const newMsg = { id: Date.now(), sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setIsGenerating(true);

    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Done ✅ — The UI has been updated as requested. This only affects display, not underlying data.',
        timestamp: 'regenerated in 12s'
      }]);
      setIsGenerating(false);
    }, 2000);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isGenerating]);

  const urlPath = previewMode === 'login'
    ? 'my-org.preview.flowforge.app/login'
    : `my-org.preview.flowforge.app/${appScreen.replace('dashboard-', '').replace('-', '/')}`;

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden font-inter">
      {/* Platform Navbar */}
      <nav className="h-14 bg-[#134E4A] flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center space-x-6 w-1/3">
          <Logo size="sm" variant="light" useSecondary={true} />
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span className="text-white/50">{project?.name || 'My Project'}</span>
            <span className="text-white/30">&gt;</span>
            <span className="text-white">Preview App</span>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="flex justify-center w-1/3 relative">
          <button
            onClick={() => setRoleMenuOpen(p => !p)}
            className="bg-teal-700/50 hover:bg-teal-700 rounded-lg px-4 py-1.5 flex items-center space-x-3 transition-colors border border-teal-600/50"
          >
            <div className="flex flex-col items-start">
              <span className="text-[9px] font-bold text-teal-300 uppercase tracking-widest leading-none">VIEWING AS:</span>
              <span className="text-sm font-medium text-white leading-tight">{activeRole}</span>
            </div>
            <ChevronDown size={14} className="text-teal-300" />
          </button>
          {roleMenuOpen && (
            <div className="absolute top-10 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden w-44">
              {(['Receptionist', 'Doctor', 'Manager'] as AppRole[]).map(role => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-sm font-medium transition-colors',
                    activeRole === role ? 'bg-teal-50 text-[#0F766E] font-bold' : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-4 w-1/3">
          <button 
            onClick={() => window.open(`https://${urlPath}`, '_blank')}
            className="text-xs font-bold text-white border border-white/20 hover:bg-white/10 rounded-lg px-4 py-2 flex items-center space-x-2 transition-colors"
          >
            <ExternalLink size={14} />
            <span>Open in New Tab</span>
          </button>
          <Button
            onClick={handleDeploy}
            className="bg-[#0F766E] hover:bg-[#0D6B63] text-white text-xs font-bold px-5 py-2 h-auto rounded-lg"
          >
            Deploy Live
          </Button>
        </div>
      </nav>

      {/* Split Pane Content */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Pane - Browser Chrome & App */}
        <div className="flex-1 flex flex-col bg-[#F1F5F9] p-4 lg:p-6 pb-0 overflow-hidden relative">

          {/* Browser Chrome Strip */}
          <div className="bg-[#E2E8F0] rounded-t-xl flex items-center px-4 py-2.5 space-x-4 border border-b-0 border-slate-300 shadow-sm shrink-0">
            <div className="flex space-x-1.5 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white rounded-md px-3 py-1 flex items-center space-x-2 max-w-xl w-full border border-slate-200 shadow-inner">
                <Lock size={12} className="text-slate-400 shrink-0" />
                <span className="text-xs text-slate-600 truncate font-mono">{urlPath}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 shrink-0">
              <div className="bg-slate-200 p-1 rounded-lg flex space-x-1 mr-2">
                <button
                  onClick={() => setPreviewMode('login')}
                  className={cn('px-2 py-1 rounded text-[10px] font-bold transition-colors', previewMode === 'login' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700')}
                >
                  LOGIN
                </button>
                <button
                  onClick={() => setPreviewMode('app')}
                  className={cn('px-2 py-1 rounded text-[10px] font-bold transition-colors', previewMode === 'app' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700')}
                >
                  APP
                </button>
              </div>
              <RotateCw 
                size={14} 
                className="text-slate-500 hover:text-slate-700 cursor-pointer transition-transform active:rotate-180" 
                onClick={() => {
                  setPreviewMode('login');
                  setTimeout(() => setPreviewMode('app'), 100);
                }}
              />
              <span className="text-[10px] text-slate-400 font-medium hidden sm:block">Sample output — {project?.name || 'My Project'}</span>
            </div>
          </div>

          {/* Generated App Viewport */}
          <div className="flex-1 bg-white border border-slate-300 border-t-0 shadow-xl overflow-hidden flex flex-col relative rounded-b-xl">
            {previewMode === 'login' ? (
              <GeneratedAppLogin
                appName={project?.name || 'My App'}
                appTheme="teal"
                roles={['Receptionist', 'Doctor', 'Manager']}
              />
            ) : (
              <GeneratedAppShell
                activeScreen={appScreen}
                activeRole={activeRole}
                onNavigate={(screen) => setAppScreen(screen)}
              >
                {/* Receptionist Dashboard */}
                {appScreen === 'dashboard-receptionist' && (
                  <div className="p-5">
                    <h1 className="text-xl font-bold text-slate-900 font-poppins">Good morning, Receptionist</h1>
                    <p className="text-sm text-slate-500 mt-1">Welcome to the {project?.name || 'App'} Dashboard.</p>
                    <div className="mt-6 grid grid-cols-3 gap-4">
                      {[
                        { label: "Today's Appointments", value: '12' },
                        { label: 'Pending Payments (PKR)', value: '8,400' },
                        { label: 'Follow-ups Due', value: '3' },
                      ].map(card => (
                        <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{card.label}</p>
                          <p className="text-2xl font-bold text-slate-900 font-poppins">{card.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 bg-indigo-600 rounded-xl px-4 py-3 text-white text-xs font-semibold flex items-center gap-2">
                      🔐 Receptionist view — Scheduling, Payments, and Patient Registration enabled.
                    </div>
                  </div>
                )}
                {appScreen === 'dashboard-doctor' && <GeneratedAppDoctorDashboard />}
                {appScreen === 'dashboard-manager' && <GeneratedAppManagerDashboard />}
                {appScreen === 'patients' && (
                  <GeneratedAppPatientsList
                    onViewPatient={() => setAppScreen('patient-detail')}
                    onNewPatient={() => setAppScreen('new-patient')}
                  />
                )}
                {appScreen === 'patient-detail' && (
                  <GeneratedAppPatientDetail onBack={() => setAppScreen('patients')} />
                )}
                {appScreen === 'new-patient' && (
                  <GeneratedAppNewPatientForm onBack={() => setAppScreen('patients')} />
                )}
                {appScreen === 'payments' && <GeneratedAppPaymentsList />}
                {appScreen === 'notifications' && <GeneratedAppNotifications />}
              </GeneratedAppShell>
            )}
          </div>
        </div>

        {/* Right Pane - UI Assistant */}
        <aside className="w-[360px] bg-white border-l border-slate-200 shrink-0 flex flex-col">
          <div className="p-5 border-b border-slate-100 shadow-sm relative z-10 bg-white">
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="font-bold text-slate-800 text-lg">UI Assistant</h2>
              <Sparkles size={18} className="text-teal-500" />
            </div>
            <p className="text-xs text-slate-500">Describe any UI change in plain language</p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50">
            {chatMessages.map(msg => (
              <div key={msg.id} className={cn('flex flex-col', msg.sender === 'user' ? 'items-end' : 'items-start')}>
                <div className={cn(
                  'px-4 py-3 text-sm max-w-[90%] shadow-sm',
                  msg.sender === 'user'
                    ? 'bg-[#4F46E5] text-white rounded-2xl rounded-tr-sm'
                    : 'bg-white text-slate-700 border border-slate-200 border-l-2 border-l-teal-400 rounded-2xl rounded-tl-sm'
                )}>
                  {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
                </div>
                {(msg as any).timestamp && (
                  <span className="text-[10px] text-slate-400 font-medium mt-1 ml-1">{(msg as any).timestamp}</span>
                )}
              </div>
            ))}

            {isGenerating && (
              <div className="flex flex-col items-start">
                <div className="px-4 py-3 text-sm max-w-[90%] shadow-sm bg-white text-slate-700 border border-slate-200 border-l-2 border-l-amber-400 rounded-2xl rounded-tl-sm flex flex-col space-y-3">
                  <p>Updating UI theme... regenerating affected screens (estimated 15s).</p>
                  <div className="flex space-x-1.5 px-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form onSubmit={handleChatSubmit} className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Describe a UI change..."
                className="w-full bg-slate-100 border border-slate-200 rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
                disabled={isGenerating}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isGenerating}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#0F766E] text-white rounded-full flex items-center justify-center hover:bg-[#0D6B63] transition-colors disabled:opacity-50 disabled:bg-slate-400"
              >
                <Send size={14} className="ml-0.5" />
              </button>
            </form>
            <p className="text-[10px] text-slate-400 text-center mt-3 leading-relaxed px-2">
              Changes affect layout and style only — to change logic or data, edit the <strong className="text-slate-500">WorkflowSpec</strong>.
            </p>
          </div>

        </aside>

      </div>
    </div>
  );
};

export default AppPreviewPage;
