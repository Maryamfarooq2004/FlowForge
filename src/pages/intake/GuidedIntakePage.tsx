import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Lightbulb, 
  CheckCircle2, 
  X, 
  Plus, 
  ArrowRight,
  Sparkles,
  Calendar,
  Stethoscope,
  Banknote,
  Search,
  Trash2,
  Bot,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../../components/shared/Logo';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/classNames';
import { motion, AnimatePresence } from 'framer-motion';
import { useIntakeStore } from '../../store/intakeStore';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';

const GuidedIntakePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Store state
  const { 
    currentStep, 
    setCurrentStep,
    screen1WorkflowStory,
    screen2PeopleRoles,
    screen3DataTracking,
    screen4RulesExceptions,
    setScreenText,
    saveScreen,
    autoSaveStatus,
    completedScreens,
    setProjectId
  } = useIntakeStore();

  // Local state for UI feedback
  const [isRuleBuilderOpen, setIsRuleBuilderOpen] = useState(false);
  const [detectedRoles, setDetectedRoles] = useState(['Receptionist', 'Doctor', 'Manager']);
  const [selectedData, setSelectedData] = useState<string[]>(['Patient Name', 'Phone Number', 'Appointment Date', 'Reason for Visit', 'Symptoms Described', 'Doctor\'s Diagnosis', 'Medicines Prescribed', 'Fee Amount Charged', 'Payment Status']);
  
  // Auto-save timer ref
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (projectId) {
      setProjectId(projectId);
    }
  }, [projectId, setProjectId]);

  const minChars = {
    1: 500,
    2: 300,
    3: 50,
    4: 50
  };

  const getActiveText = () => {
    switch(currentStep) {
      case 1: return screen1WorkflowStory;
      case 2: return screen2PeopleRoles;
      case 3: return screen3DataTracking;
      case 4: return screen4RulesExceptions;
      default: return '';
    }
  };

  const activeText = getActiveText();
  const activeMinChars = minChars[currentStep as keyof typeof minChars];
  const progress = Math.min(Math.round((activeText.length / activeMinChars) * 100), 100);

  // Debounced save effect
  useEffect(() => {
    if (!projectId || !activeText || activeText.length < 10) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      saveScreen(projectId, currentStep as 1|2|3|4, activeText);
    }, 1000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [activeText, currentStep, projectId, saveScreen]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setScreenText(currentStep as 1|2|3|4, e.target.value);
  };

  const addHint = (hint: string) => {
    const newText = activeText + (activeText ? ' ' : '') + hint;
    setScreenText(currentStep as 1|2|3|4, newText);
  };

  const removeRole = (role: string) => {
    setDetectedRoles(prev => prev.filter(r => r !== role));
  };

  const toggleData = (item: string) => {
    setSelectedData(prev => {
      const updated = prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item];
      // Also update store text to reflect selection for assembly
      setScreenText(3, `Selected fields: ${updated.join(', ')}`);
      return updated;
    });
  };

  const handleNext = () => {
    if (activeText.length < activeMinChars) {
      toast.error(`Please provide more detail (minimum ${activeMinChars} characters)`);
      return;
    }

    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as 1|2|3|4);
    } else {
      navigate(`/project/${projectId}/intake/review`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col overflow-hidden">
      {/* Guided Intake Header */}
      <nav className="h-14 bg-[#134E4A] flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center space-x-6">
          <Logo size="sm" variant="light" useSecondary={true} />
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span className="text-white/50">New Project</span>
            <span className="text-white/30">&gt;</span>
            <span className="text-white">Guided Intake</span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-10">
          {[
            { id: 1, label: 'Step 1: Setup' },
            { id: 2, label: 'Step 2: People & Roles' },
            { id: 3, label: 'Step 3: Workflow' },
            { id: 4, label: 'Step 4: Rules' },
          ].map((step) => (
            <button 
              key={step.id}
              onClick={() => setCurrentStep(step.id as 1|2|3|4)}
              className={cn(
                "text-sm font-bold transition-all pb-1 mt-1 border-b-2",
                currentStep === step.id 
                  ? "text-white border-white" 
                  : "text-white/40 border-transparent hover:text-white/70"
              )}
            >
              {step.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 mr-4">
            {autoSaveStatus === 'saving' && <Loader2 size={14} className="text-white/50 animate-spin" />}
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {autoSaveStatus === 'saving' ? 'Saving...' : autoSaveStatus === 'saved' ? 'Saved' : 'Auto-save'}
            </span>
          </div>
          <button className="text-white/70 hover:text-white">
            <Bell size={20} />
          </button>
          <Avatar name={user?.fullName || 'User'} size="sm" className="bg-[#34D399] text-[#134E4A]" />
        </div>
      </nav>

      {/* Sub-progress Indicator */}
      <div className="bg-white h-10 border-b border-slate-200 flex items-center justify-center px-6 shrink-0 shadow-sm">
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4].map((dot) => (
            <div 
              key={dot}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-500",
                dot <= currentStep ? "bg-[#0F766E] scale-125" : "bg-slate-200"
              )}
            />
          ))}
        </div>
        <span className="ml-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {currentStep === 1 && 'Workflow Story'}
          {currentStep === 2 && 'People & Roles'}
          {currentStep === 3 && 'Data & Tracking (Step 3 of 4)'}
          {currentStep === 4 && 'Rules & Exceptions'}
        </span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto p-12">
          <div className="max-w-5xl mx-auto flex gap-12">
            
            {/* Left Content Card */}
            <div className="flex-1 space-y-8">
              <AnimatePresence mode="wait">
                {currentStep === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm"
                  >
                    <div className="inline-flex items-center px-3 py-1 bg-teal-50 text-[#0F766E] rounded-full text-xs font-bold mb-6">
                      1 / 4
                    </div>
                    <h1 className="text-[32px] font-bold text-slate-900 font-poppins leading-tight mb-3">Tell us your full workflow story</h1>
                    <p className="text-slate-500 font-inter mb-8">
                      Walk us through your process as if you were explaining it to a new team member. Be as specific as possible about every handoff and action.
                    </p>

                    <div className="relative">
                      <textarea 
                        value={screen1WorkflowStory}
                        onChange={handleTextChange}
                        placeholder="Example: A patient calls to book an appointment. The receptionist takes their details and checks the calendar..."
                        className="w-full min-h-[320px] bg-slate-50/50 border border-slate-200 rounded-2xl p-6 text-slate-700 font-inter focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all resize-none leading-relaxed"
                      />
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          {screen1WorkflowStory.length} / {minChars[1]} minimum characters
                        </div>
                        <div className="text-xs font-bold text-[#0F766E] uppercase tracking-widest">
                          {progress}% Complete
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                        <motion.div 
                          className="h-full bg-[#0F766E]"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-10 pt-10 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Need Inspiration? Click a hint:</p>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { text: 'Patient calls to book', icon: '📞' },
                          { text: 'Receptionist enters details', icon: '✍️' },
                          { text: 'Doctor reviews history', icon: '👨‍⚕️' },
                          { text: 'System sends reminder', icon: '🔔' },
                        ].map((hint, i) => (
                          <button 
                            key={i}
                            onClick={() => addHint(hint.text)}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:border-[#0F766E] hover:text-[#0F766E] hover:bg-teal-50 transition-all flex items-center space-x-2"
                          >
                            <span>{hint.text}</span>
                            <span>{hint.icon}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : currentStep === 2 ? (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm"
                  >
                    <div className="inline-flex items-center px-3 py-1 bg-teal-50 text-[#0F766E] rounded-full text-xs font-bold mb-6">
                      2 / 4
                    </div>
                    <h1 className="text-[32px] font-bold text-slate-900 font-poppins leading-tight mb-3">Who is involved in your workflow?</h1>
                    <p className="text-slate-500 font-inter mb-8">
                      Tell us about everyone who plays a part. Mentioning their titles helps us build your permissions engine automatically.
                    </p>

                    <div className="relative">
                      <textarea 
                        value={screen2PeopleRoles}
                        onChange={handleTextChange}
                        placeholder="Example: Our receptionist handles booking and initial intake. Then, the doctor reviews the history and the manager approves the insurance claim..."
                        className="w-full min-h-[240px] bg-slate-50/50 border border-slate-200 rounded-2xl p-6 text-slate-700 font-inter focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all resize-none leading-relaxed"
                      />
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          {screen2PeopleRoles.length} / {minChars[2]} minimum characters
                        </div>
                        <div className="text-xs font-bold text-[#0F766E] uppercase tracking-widest">
                          {progress}% Complete
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                        <motion.div 
                          className="h-full bg-[#0F766E]"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Detected Roles */}
                    <div className="mt-10 pt-10 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-bold text-slate-700 uppercase tracking-tight">Roles we detected in your description:</p>
                        <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider flex items-center space-x-1">
                          <CheckCircle2 size={12} />
                          <span>3 ROLES DETECTED — GREAT!</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {detectedRoles.map((role, i) => (
                          <div 
                            key={i}
                            className="px-4 py-2 bg-[#0F766E] text-white rounded-full text-sm font-bold flex items-center space-x-2 shadow-lg shadow-teal-900/10"
                          >
                            <span>{role}</span>
                            <button onClick={() => removeRole(role)} className="hover:text-white/60 transition-colors">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        <button className="px-4 py-2 border-2 border-dashed border-slate-200 rounded-full text-sm font-bold text-slate-400 hover:border-[#0F766E] hover:text-[#0F766E] transition-all">
                          + Add a role manually
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : currentStep === 3 ? (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm"
                  >
                    <div className="inline-flex items-center px-3 py-1 bg-teal-50 text-[#0F766E] rounded-full text-xs font-bold mb-6">
                      3 / 4
                    </div>
                    <h1 className="text-[32px] font-bold text-slate-900 font-poppins leading-tight mb-3">What information do you record?</h1>
                    <p className="text-slate-500 font-inter mb-8">
                      Think of your paper register or Excel sheet — what do you write down, and when?
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Before Visit */}
                      <div>
                        <div className="flex items-center space-x-2 mb-6">
                          <Calendar size={18} className="text-orange-500" />
                          <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">Before the Visit</span>
                        </div>
                        <div className="space-y-3">
                          {['Patient Name', 'Phone Number', 'Appointment Date', 'Reason for Visit'].map(item => (
                            <button 
                              key={item}
                              onClick={() => toggleData(item)}
                              className={cn(
                                "w-full flex items-center space-x-3 p-3 rounded-lg border text-left transition-all",
                                selectedData.includes(item) ? "bg-[#0F766E]/5 border-[#0F766E]/20" : "bg-white border-slate-200 hover:border-slate-300"
                              )}
                            >
                              <div className={cn(
                                "flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors",
                                selectedData.includes(item) ? "bg-[#0F766E] text-white" : "border border-slate-300 bg-slate-50"
                              )}>
                                {selectedData.includes(item) && <CheckCircle2 size={14} />}
                              </div>
                              <span className={cn(
                                "text-sm font-medium",
                                selectedData.includes(item) ? "text-slate-800" : "text-slate-500"
                              )}>{item}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* During Visit */}
                      <div>
                        <div className="flex items-center space-x-2 mb-6">
                          <Stethoscope size={18} className="text-blue-500" />
                          <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide">During the Visit</span>
                        </div>
                        <div className="space-y-3">
                          {['Symptoms Described', 'Doctor\'s Diagnosis', 'Medicines Prescribed', 'Lab Test Results'].map(item => (
                            <button 
                              key={item}
                              onClick={() => toggleData(item)}
                              className={cn(
                                "w-full flex items-center space-x-3 p-3 rounded-lg border text-left transition-all",
                                selectedData.includes(item) ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200 hover:border-slate-300"
                              )}
                            >
                              <div className={cn(
                                "flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors",
                                selectedData.includes(item) ? "bg-blue-600 text-white" : "border border-slate-300 bg-slate-50"
                              )}>
                                {selectedData.includes(item) && <CheckCircle2 size={14} />}
                              </div>
                              <span className={cn(
                                "text-sm font-medium",
                                selectedData.includes(item) ? "text-slate-800" : "text-slate-500"
                              )}>{item}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* After Visit */}
                      <div>
                        <div className="flex items-center space-x-2 mb-6">
                          <Banknote size={18} className="text-green-500" />
                          <span className="text-xs font-semibold text-green-500 uppercase tracking-wide">After the Visit</span>
                        </div>
                        <div className="space-y-3">
                          {['Fee Amount Charged', 'Payment Status', 'Follow-up Date', 'Patient Feedback'].map(item => (
                            <button 
                              key={item}
                              onClick={() => toggleData(item)}
                              className={cn(
                                "w-full flex items-center space-x-3 p-3 rounded-lg border text-left transition-all",
                                selectedData.includes(item) ? "bg-green-50 border-green-200" : "bg-white border-slate-200 hover:border-slate-300"
                              )}
                            >
                              <div className={cn(
                                "flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors",
                                selectedData.includes(item) ? "bg-green-600 text-white" : "border border-slate-300 bg-slate-50"
                              )}>
                                {selectedData.includes(item) && <CheckCircle2 size={14} />}
                              </div>
                              <span className={cn(
                                "text-sm font-medium",
                                selectedData.includes(item) ? "text-slate-800" : "text-slate-500"
                              )}>{item}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg px-4 py-3 inline-flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2 size={18} />
                      ✓ 3 stages covered — you're all set
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm col-span-2 w-full max-w-3xl mx-auto"
                  >
                    <div className="inline-flex items-center px-3 py-1 bg-teal-50 text-[#0F766E] rounded-full text-xs font-bold mb-6">
                      4 / 4
                    </div>
                    <h1 className="text-[32px] font-bold text-slate-900 font-poppins leading-tight mb-3">What are your rules and special conditions?</h1>
                    <p className="text-slate-500 font-inter mb-8">
                      These are the real-life policies your staff follow — we will turn them into system logic automatically. Describe them as you would to a new employee.
                    </p>

                    <div className="relative">
                      <textarea 
                        value={screen4RulesExceptions}
                        onChange={handleTextChange}
                        placeholder="e.g. Patients with an unpaid balance over $50 cannot book new appointments unless it's an emergency. All new patients must receive a follow-up call within 3 days of their first visit..."
                        className="w-full min-h-[180px] bg-slate-50/50 border border-slate-200 rounded-2xl p-6 text-slate-700 font-inter focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all resize-none leading-relaxed"
                      />
                      
                      {screen4RulesExceptions.length > 20 && (
                        <div className="absolute bottom-4 right-4 bg-teal-100 text-[#0F766E] text-xs font-bold px-2 py-1 rounded flex items-center space-x-1">
                          <CheckCircle2 size={14} />
                          <span>READY</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center space-x-2 text-sm text-slate-500">
                      <Search size={14} className="animate-pulse text-amber-500" />
                      <span>Detecting rules... • </span>
                      <span className="text-green-600 font-medium flex items-center"><CheckCircle2 size={14} className="mr-1" /> 2 rules detected automatically</span>
                    </div>

                    <div className="mt-8">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">COMMON EXAMPLES</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Unpaid balance blocks booking 🚫', 
                          'Follow-up within 3 days 📅', 
                          'No-show fee after 15 mins ⏰', 
                          'VIP priority queue ⭐'
                        ].map((s, i) => (
                          <button key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 border border-slate-200 rounded-xl overflow-hidden">
                      <button 
                        onClick={() => setIsRuleBuilderOpen(!isRuleBuilderOpen)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400">□</span>
                          <span className="font-semibold text-slate-700 text-sm">Or build rules visually</span>
                        </div>
                        {isRuleBuilderOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      
                      <AnimatePresence>
                        {isRuleBuilderOpen && (
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden bg-white p-6 border-t border-slate-200"
                          >
                            <div className="flex items-center space-x-3 mb-4">
                              <span className="bg-teal-500 text-white rounded px-2 py-1 text-[10px] font-bold">IF</span>
                              <input type="text" value="Patient Balance" className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 w-40" readOnly />
                              <select className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-sm text-slate-700">
                                <option>&gt;</option>
                                <option>&lt;</option>
                                <option>=</option>
                              </select>
                              <input type="text" value="0" className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 w-20 text-center" readOnly />
                              <ArrowRight size={16} className="text-slate-400" />
                              <input type="text" value="Block Appointment Booking" className="bg-teal-50 border border-teal-200 text-teal-800 rounded-lg px-3 py-2 text-sm w-56 font-medium" readOnly />
                              <button className="text-red-400 hover:text-red-600 p-2">
                                <Trash2 size={18} />
                              </button>
                            </div>
                            <button className="w-full border-2 border-dashed border-slate-200 rounded-lg py-3 text-sm font-medium text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors">
                              + Add another rule
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="mt-10 flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg text-sm font-medium border border-green-100">
                        <CheckCircle2 size={16} />
                        <span>Rules captured — ready for generation</span>
                      </div>
                      <p className="text-xs text-slate-400 right-aligned">Don't worry about technical wording — describe rules naturally.</p>
                    </div>

                    <div className="mt-8">
                      <Button 
                        onClick={handleNext}
                        className="w-full h-14 bg-gradient-to-r from-[#0F766E] to-[#4F46E5] text-white font-semibold text-lg rounded-2xl shadow-xl shadow-teal-900/10 transition-transform active:scale-[0.98]"
                      >
                        Complete Intake & Review <ArrowRight size={20} className="ml-2 inline" />
                      </Button>
                    </div>

                    {/* AI Chat Bubble */}
                    <div className="fixed bottom-8 right-8 flex items-end space-x-3 z-50">
                      <div className="bg-white border border-slate-200 shadow-xl rounded-2xl rounded-br-none p-4 w-64">
                        <p className="text-sm text-slate-700 font-medium">Need help defining a rule? Tell me what you're trying to achieve.</p>
                      </div>
                      <div className="w-14 h-14 bg-[#134E4A] rounded-full flex flex-col items-center justify-center text-white shadow-xl cursor-pointer hover:scale-105 transition-transform border-4 border-white">
                        <Bot size={24} />
                        <span className="text-[8px] font-bold mt-0.5 uppercase">AI Assist</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Page Footer Actions (Only for Step 1-3) */}
              {currentStep < 4 && (
                <div className="flex items-center justify-between py-6">
                  {currentStep > 1 ? (
                    <button 
                      onClick={() => setCurrentStep((currentStep - 1) as 1|2|3|4)}
                      className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center"
                    >
                      ← Back
                    </button>
                  ) : (
                    <div className="flex items-center space-x-3 text-slate-400">
                      <Sparkles size={18} className="animate-pulse text-[#34D399]" />
                      <span className="text-xs font-medium italic">Your story is being analyzed in real-time...</span>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleNext}
                    className="h-14 px-10 rounded-2xl bg-[#0F766E] hover:bg-[#0D6B63] text-white font-bold flex items-center space-x-3 shadow-xl shadow-teal-900/10 transition-all active:scale-95"
                  >
                    <span>
                      {currentStep === 1 && 'Next: People & Roles'}
                      {currentStep === 2 && 'Next: Data & Tracking'}
                      {currentStep === 3 && 'Next: Rules & Exceptions'}
                    </span>
                    <ArrowRight size={20} />
                  </Button>
                </div>
              )}
            </div>

            {/* Right Sidebar (Hidden on Step 4) */}
            {currentStep < 4 && (
              <aside className="w-80 shrink-0 space-y-6">
              {/* Pro Tip Card */}
              <div className="bg-[#0F766E] rounded-3xl p-8 text-white shadow-xl shadow-teal-900/10">
                <div className="flex items-center space-x-3 mb-4">
                  <Lightbulb size={24} className="text-[#34D399]" />
                  <h3 className="text-xl font-bold font-poppins">{currentStep === 1 ? 'Pro Tip' : 'Why we need this'}</h3>
                </div>
                
                {currentStep === 1 ? (
                  <>
                    <p className="text-teal-50 text-sm leading-relaxed mb-6 font-inter opacity-90">
                      Be as detailed as possible. Mention the specific tools (Excel, Phone, Custom CRM) you use at each step. This helps our AI architect build a more precise digital twin of your workflow.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center space-x-3 text-xs font-bold">
                        <div className="h-5 w-5 rounded-full bg-teal-500/30 flex items-center justify-center text-[#34D399]">
                          <CheckCircle2 size={12} strokeWidth={3} />
                        </div>
                        <span>Identify who starts the task</span>
                      </li>
                      <li className="flex items-center space-x-3 text-xs font-bold">
                        <div className="h-5 w-5 rounded-full bg-teal-500/30 flex items-center justify-center text-[#34D399]">
                          <CheckCircle2 size={12} strokeWidth={3} />
                        </div>
                        <span>Note where the data is stored</span>
                      </li>
                      <li className="flex items-center space-x-3 text-xs font-bold">
                        <div className="h-5 w-5 rounded-full bg-teal-500/30 flex items-center justify-center text-[#34D399]">
                          <CheckCircle2 size={12} strokeWidth={3} />
                        </div>
                        <span>Mention common bottlenecks</span>
                      </li>
                    </ul>
                  </>
                ) : currentStep === 2 ? (
                  <>
                    <p className="bg-teal-900/30 p-4 rounded-xl text-xs leading-relaxed italic mb-6 border border-teal-500/20">
                      "Identifying roles now saves up to 4 hours of manual permission configuration later."
                    </p>
                    <p className="text-teal-50 text-xs font-bold uppercase tracking-widest mb-2">PRO TIP:</p>
                    <p className="text-teal-100 text-xs leading-relaxed">
                      Think about everyone who touches a document or task, even if they only 'review' or 'acknowledge' it.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-teal-50 text-sm leading-relaxed mb-6 font-inter opacity-90">
                      This information defines the fields in your app's database. By organizing them into stages, FlowForge can automatically build the right forms for your staff to fill out at each step.
                    </p>
                    
                    {/* Decorative Blob */}
                    <div className="mt-8 relative h-48 w-full rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
                      <div className="absolute w-32 h-32 bg-emerald-400 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob"></div>
                      <div className="absolute w-32 h-32 bg-teal-500 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-2000 translate-x-10"></div>
                      <div className="absolute w-32 h-32 bg-indigo-500 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-4000 -translate-y-8"></div>
                      <div className="relative z-10 w-24 h-24 bg-gradient-to-tr from-teal-400 to-emerald-300 rounded-[40%] shadow-[inset_0_-10px_20px_rgba(0,0,0,0.2)] backdrop-blur-md opacity-80 animate-spin-slow"></div>
                    </div>
                  </>
                )}
              </div>

              {/* Branding Image Card */}
              <div className="relative group overflow-hidden rounded-3xl bg-slate-900 h-64 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
                  alt="Team collaboration" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-[10px] font-bold text-teal-400 uppercase tracking-[0.2em] mb-1">Collaborative Design</div>
                  <div className="text-lg font-bold text-white font-poppins">Building FlowForge together.</div>
                </div>
              </div>
            </aside>
            )}


          </div>
        </main>
      </div>
    </div>
  );
};

export default GuidedIntakePage;
