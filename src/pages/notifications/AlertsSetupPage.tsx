import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../../components/shared/Logo';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/classNames';
import { 
  Bell, 
  HelpCircle,
  Info,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  ArrowRight,
  ArrowLeft,
  Mail,
  Eye,
  EyeOff
} from 'lucide-react';

const AlertsSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const [isEmailSettingsOpen, setIsEmailSettingsOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [senderEmail, setSenderEmail] = useState('');

  const [alerts, setAlerts] = useState([
    { id: 1, event: 'A follow-up visit is overdue', desc: '(e.g. patient was not called back in 3 days)', when: 'On the due date and 1 day after', email: true, inApp: true, active: true },
    { id: 2, event: 'A fee payment is outstanding', desc: '', when: 'After 7 days unpaid', email: true, inApp: true, active: true },
    { id: 3, event: 'A new appointment is booked', desc: '', when: 'Immediately when booked', email: true, inApp: false, active: true },
    { id: 4, event: 'A workflow task is stuck', desc: '', when: 'After 2 hours with no action', email: false, inApp: true, active: false },
  ]);

  const toggleAlert = (id: number, field: 'email' | 'inApp' | 'active') => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, [field]: !alert[field] } : alert
    ));
  };

  const handleSave = () => {
    navigate(`/project/${projectId || 'new'}/generating`);
  };

  const handleBack = () => {
    navigate(`/project/${projectId || 'new'}/blueprint`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <nav className="w-full h-14 bg-[#134E4A] flex items-center justify-between px-6 shrink-0 sticky top-0 z-50">
        <div className="flex items-center space-x-6">
          <Logo size="sm" variant="light" useSecondary={true} />
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span className="text-white/50">Project: My Organization</span>
            <span className="text-white/30">&gt;</span>
            <span className="text-white">Set Up Alerts</span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <button className="text-sm font-bold text-white/40 hover:text-white/70 transition-colors pb-1 mt-1 border-b-2 border-transparent">Workflows</button>
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

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-8 lg:p-12 pb-32">
        
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-slate-900 font-poppins leading-tight mb-2">Set Up Alerts for Your App</h1>
          <p className="text-slate-500 font-inter">
            Choose which events in your clinic app should send alerts, and how. These will be built directly into your application.
          </p>
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info size={20} className="text-[#0F766E] shrink-0 mt-0.5" />
          <p className="text-sm text-teal-900 font-medium">
            We found 4 possible alert events in your workflow. Toggle the ones you want — your app will handle the rest automatically.
          </p>
        </div>

        {/* Alerts Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-6">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0F766E] text-white">
              <tr>
                <th className="px-6 py-4 font-semibold text-sm w-2/5">What Happens in Your App</th>
                <th className="px-6 py-4 font-semibold text-sm w-1/5">When to Alert</th>
                <th className="px-6 py-4 font-semibold text-sm w-1/5 text-center">Send Via</th>
                <th className="px-6 py-4 font-semibold text-sm w-1/5 text-center">Turn On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alerts.map((alert, index) => (
                <tr key={alert.id} className={cn("transition-colors hover:bg-teal-50/30", index % 2 === 0 ? "bg-white" : "bg-slate-50", !alert.active && "opacity-60 grayscale")}>
                  <td className="px-6 py-5">
                    <p className="font-semibold text-slate-800 text-sm leading-snug">{alert.event}</p>
                    {alert.desc && <p className="text-xs text-slate-500 mt-1">{alert.desc}</p>}
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm text-slate-600">{alert.when}</p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      {/* Email Toggle */}
                      <div className="flex flex-col items-center space-y-1">
                        <button 
                          onClick={() => toggleAlert(alert.id, 'email')}
                          disabled={!alert.active}
                          className={cn(
                            "w-8 h-4 rounded-full relative transition-colors duration-200",
                            alert.email ? "bg-[#0F766E]" : "bg-slate-200"
                          )}
                        >
                          <div className={cn(
                            "w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform duration-200",
                            alert.email ? "translate-x-4.5 left-0.5" : "translate-x-0.5 left-0"
                          )} />
                        </button>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">EMAIL</span>
                      </div>
                      
                      {/* In-App Toggle */}
                      <div className="flex flex-col items-center space-y-1">
                        <button 
                          onClick={() => toggleAlert(alert.id, 'inApp')}
                          disabled={!alert.active}
                          className={cn(
                            "w-8 h-4 rounded-full relative transition-colors duration-200",
                            alert.inApp ? "bg-[#0F766E]" : "bg-slate-200"
                          )}
                        >
                          <div className={cn(
                            "w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform duration-200",
                            alert.inApp ? "translate-x-4.5 left-0.5" : "translate-x-0.5 left-0"
                          )} />
                        </button>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">IN-APP</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {/* Master Toggle */}
                    <button 
                      onClick={() => toggleAlert(alert.id, 'active')}
                      className={cn(
                        "w-10 h-6 rounded-full relative transition-colors duration-200 mx-auto",
                        alert.active ? "bg-[#0F766E]" : "bg-slate-300"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-200 shadow-sm",
                        alert.active ? "translate-x-5 left-0.5" : "translate-x-1 left-0"
                      )} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="text-[#0F766E] font-semibold text-sm flex items-center space-x-2 hover:underline mb-10">
          <PlusCircle size={16} />
          <span>Add a custom alert</span>
        </button>

        {/* Email Delivery Settings Accordion */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <button 
            onClick={() => setIsEmailSettingsOpen(!isEmailSettingsOpen)}
            className="w-full flex items-center justify-between p-6 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Mail size={20} className="text-slate-500" />
              <span className="font-semibold text-slate-800 text-lg">Email Delivery Settings</span>
            </div>
            {isEmailSettingsOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
          </button>
          
          {isEmailSettingsOpen && (
            <div className="p-6 border-t border-slate-200 space-y-6">
              <p className="text-sm text-slate-500">
                Your app will use SendGrid to send emails. You can add your SendGrid key after deployment, or use our default shared sender.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">YOUR SENDGRID API KEY (OPTIONAL)</label>
                  <div className="relative">
                    <input 
                      type={showApiKey ? 'text' : 'password'} 
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..." 
                      className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                    />
                    <button 
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">SENDER EMAIL ADDRESS</label>
                  <input 
                    type="email" 
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="notifications@yourclinic.com" 
                    className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  Test Connection
                </button>
                <div className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-2 border border-amber-200">
                  <span>Using default FlowForge sender</span>
                  <button className="hover:text-amber-900 ml-1">×</button>
                </div>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <div className="w-full bg-white border-t border-slate-200 px-8 py-4 sticky bottom-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          
          <Button 
            onClick={handleSave}
            className="h-12 px-6 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#4F46E5] text-white font-bold flex items-center space-x-2 shadow-lg shadow-teal-900/10 transition-transform active:scale-[0.98]"
          >
            <span>Save Alert Settings & Continue</span>
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertsSetupPage;
