import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ChevronRight, 
  HelpCircle, 
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Users,
  Building,
  FlaskConical,
  Mail,
  MessageSquare,
  Smartphone,
  CreditCard,
  Banknote,
  History,
  Activity,
  FileText
} from 'lucide-react';
import { Stepper } from '../../components/shared/Stepper';
import type { Step } from '../../components/shared/Stepper';
import { Button } from '../../components/ui/Button';
import { Slider } from '../../components/ui/Slider';
import { Switch } from '../../components/ui/Switch';
import { cn } from '../../utils/classNames';
import { motion } from 'framer-motion';

import { useNavigate, useParams } from 'react-router-dom';

const INTAKE_STEPS: Step[] = [
  { id: 1, label: 'Choose Domain' },
  { id: 2, label: 'Intake Form' },
  { id: 3, label: 'Guided Intake' },
  { id: 4, label: 'Review Spec' },
  { id: 5, label: 'Generate' },
];

const IntakeFormPage: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['receptionist', 'doctor']);
  const [selectedPayments, setSelectedPayments] = useState<string[]>(['cash', 'credit']);
  const [approvalLevel, setApprovalLevel] = useState('doctor');

  const rolesWeight = (selectedRoles.length / 5) * 30;
  const paymentsWeight = (selectedPayments.length / 4) * 30;
  const progress = Math.min(Math.round(40 + rolesWeight + paymentsWeight), 100);

  const handleContinue = () => {
    navigate(`/project/${projectId || 'new'}/intake/story`);
  };

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const togglePayment = (method: string) => {
    setSelectedPayments(prev => 
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header with Stepper */}
      <div className="bg-white border-b border-slate-200 py-4 shadow-sm sticky top-0 z-50">
        <Stepper steps={INTAKE_STEPS} currentStep={2} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Progress Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 p-8 flex flex-col h-[calc(100vh-5.5rem)] sticky top-[5.5rem]">
          <div className="relative h-32 w-32 mx-auto mb-10">
            <svg className="h-full w-full" viewBox="0 0 100 100">
              <circle 
                className="text-slate-100 stroke-current" 
                strokeWidth="8" 
                fill="transparent" 
                r="40" 
                cx="50" 
                cy="50" 
              />
              <motion.circle 
                className="text-[#0F766E] stroke-current" 
                strokeWidth="8" 
                strokeLinecap="round" 
                fill="transparent" 
                r="40" 
                cx="50" 
                cy="50"
                initial={{ strokeDasharray: "0 251" }}
                animate={{ strokeDasharray: `${(progress / 100) * 251} 251` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">{progress}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Complete</span>
            </div>
          </div>

          <nav className="flex-1 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm font-bold text-[#0F766E]">
                <CheckCircle2 size={18} fill="#0F766E" className="text-white" />
                <span>Personal Info</span>
              </div>
              <div className="flex items-center space-x-3 text-sm font-bold text-[#0F766E]">
                <CheckCircle2 size={18} fill="#0F766E" className="text-white" />
                <span>Medical History</span>
              </div>
              <div className="flex items-center space-x-3 text-sm font-bold text-[#0F766E]">
                {progress === 100 ? (
                  <CheckCircle2 size={18} fill="#0F766E" className="text-white" />
                ) : (
                  <div className="h-[18px] w-[18px] rounded-full border-4 border-[#0F766E]" />
                )}
                <span>Symptoms</span>
              </div>
              <div className="flex items-center space-x-3 text-sm font-bold text-slate-300">
                <div className="h-[18px] w-[18px] rounded-full border-2 border-slate-200" />
                <span>Insurance</span>
              </div>
              <div className="flex items-center space-x-3 text-sm font-bold text-slate-300">
                <div className="h-[18px] w-[18px] rounded-full border-2 border-slate-200" />
                <span>Consent</span>
              </div>
            </div>
          </nav>

          <div className="mt-auto space-y-4">
            <button className="flex items-center space-x-2 text-sm text-slate-400 hover:text-slate-600 font-medium">
              <HelpCircle size={18} />
              <span>Help Center</span>
            </button>
            <Button variant="outline" className="w-full text-[#0F766E] border-[#0F766E]">
              Save Draft
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-12 pb-24">
          <div className="max-w-4xl mx-auto">
            <header className="mb-12">
              <h1 className="text-3xl font-bold text-slate-900 font-poppins mb-2">Tell us about your clinic operations</h1>
              <p className="text-slate-500 font-inter">Help us customize your workspace by detailing your team structure and daily throughput.</p>
            </header>

            {/* Team & Roles */}
            <section className="mb-12">
              <div className="flex items-center space-x-2 mb-6">
                <div className="h-2 w-2 rounded-full bg-[#0F766E]" />
                <h3 className="text-xs font-bold text-[#0F766E] uppercase tracking-[0.2em]">Team & Roles</h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {[
                  { id: 'receptionist', label: 'Receptionist', icon: UserCheck },
                  { id: 'doctor', label: 'Doctor', icon: Stethoscope },
                  { id: 'nurse', label: 'Nurse', icon: Users },
                  { id: 'admin', label: 'Admin', icon: Building },
                  { id: 'lab', label: 'Lab Tech', icon: FlaskConical },
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => toggleRole(role.id)}
                    className={cn(
                      "relative p-6 bg-white border-2 rounded-2xl flex flex-col items-center gap-3 transition-all",
                      selectedRoles.includes(role.id) 
                        ? "border-[#0F766E] bg-teal-50/30" 
                        : "border-slate-100 hover:border-slate-200"
                    )}
                  >
                    {selectedRoles.includes(role.id) && (
                      <div className="absolute top-2 right-2 text-[#0F766E]">
                        <CheckCircle2 size={16} fill="#0F766E" className="text-white" />
                      </div>
                    )}
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#0F766E]">
                      <role.icon size={20} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{role.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Patient Volume */}
            <section className="mb-12">
              <div className="flex items-center space-x-2 mb-6">
                <div className="h-2 w-2 rounded-full bg-[#0F766E]" />
                <h3 className="text-xs font-bold text-[#0F766E] uppercase tracking-[0.2em]">Daily Patient Volume</h3>
              </div>
              
              <Slider 
                min={1} 
                max={500} 
                defaultValue={75}
                tooltipSuffix=" patients/day"
                markers={[
                  { value: 1, label: '1 Patient' },
                  { value: 100, label: '100' },
                  { value: 250, label: '250' },
                  { value: 500, label: '500+ Patients' },
                ]}
              />
            </section>

            {/* Approval & Notifications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              {/* Approval Levels */}
              <section>
                <div className="flex items-center space-x-2 mb-6">
                  <div className="h-2 w-2 rounded-full bg-[#0F766E]" />
                  <h3 className="text-xs font-bold text-[#0F766E] uppercase tracking-[0.2em]">Approval Levels</h3>
                </div>
                
                <div className="space-y-3">
                  {[
                    { id: 'none', label: 'No approval needed' },
                    { id: 'doctor', label: 'Doctor must approve prescriptions' },
                    { id: 'manager', label: 'Manager approves fee waivers' },
                  ].map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setApprovalLevel(level.id)}
                      className={cn(
                        "w-full flex items-center p-4 border-2 rounded-xl transition-all",
                        approvalLevel === level.id 
                          ? "border-[#0F766E] bg-teal-50/50" 
                          : "border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center mr-4",
                        approvalLevel === level.id ? "border-[#0F766E]" : "border-slate-300"
                      )}>
                        {approvalLevel === level.id && <div className="h-2.5 w-2.5 rounded-full bg-[#0F766E]" />}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{level.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Notification Channels */}
              <section>
                <div className="flex items-center space-x-2 mb-6">
                  <div className="h-2 w-2 rounded-full bg-[#0F766E]" />
                  <h3 className="text-xs font-bold text-[#0F766E] uppercase tracking-[0.2em]">Notification Channels</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Mail size={18} className="text-[#0F766E]" />
                      <span className="text-sm font-semibold text-slate-700">Email Notifications</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <MessageSquare size={18} className="text-slate-400" />
                      <span className="text-sm font-semibold text-slate-700">SMS Alerts</span>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Smartphone size={18} className="text-[#0F766E]" />
                      <span className="text-sm font-semibold text-slate-700">WhatsApp Support</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </section>
            </div>

            {/* Payment Methods */}
            <section className="mb-16">
              <div className="flex items-center space-x-2 mb-6">
                <div className="h-2 w-2 rounded-full bg-[#0F766E]" />
                <h3 className="text-xs font-bold text-[#0F766E] uppercase tracking-[0.2em]">Payment Methods</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'cash', label: 'Cash', icon: Banknote },
                  { id: 'credit', label: 'Credit Card', icon: CreditCard },
                  { id: 'insurance', label: 'Insurance', icon: ShieldCheck },
                  { id: 'online', label: 'Online Transfer', icon: Smartphone },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => togglePayment(method.id)}
                    className={cn(
                      "p-6 bg-white border-2 rounded-2xl flex flex-col items-center gap-3 transition-all",
                      selectedPayments.includes(method.id) 
                        ? "border-[#0F766E] bg-teal-50/30" 
                        : "border-slate-100 hover:border-slate-200"
                    )}
                  >
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#0F766E]">
                      <method.icon size={20} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{method.label}</span>
                      {selectedPayments.includes(method.id) && <CheckCircle2 size={14} className="text-[#0F766E]" />}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Form Footer */}
            <div className="flex flex-col space-y-6 pt-12 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <ShieldCheck size={14} />
                  <span>All data is encrypted and HIPAA compliant</span>
                </div>
                <button className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Skip for Now</button>
              </div>
              
              <Button 
                onClick={handleContinue}
                className="h-14 w-full bg-[#0F766E] text-white text-lg font-bold rounded-2xl flex items-center justify-center space-x-3 shadow-xl shadow-teal-900/10"
              >
                <span>Save & Continue to Guided Intake</span>
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default IntakeFormPage;
