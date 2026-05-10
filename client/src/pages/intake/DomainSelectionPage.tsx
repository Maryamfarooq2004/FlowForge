import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, GraduationCap, Check, Bell, HelpCircle, ChevronDown } from 'lucide-react';
import { Logo } from '../../components/shared/Logo';
import { Stepper } from '../../components/shared/Stepper';
import type { Step } from '../../components/shared/Stepper';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { cn } from '../../utils/classNames';
import { motion } from 'framer-motion';

const INTAKE_STEPS: Step[] = [
  { id: 1, label: 'Choose Domain' },
  { id: 2, label: 'Intake Form' },
  { id: 3, label: 'Guided Intake' },
  { id: 4, label: 'Review Spec' },
  { id: 5, label: 'Generate' },
];

const DomainSelectionPage: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState<'clinic' | 'school' | null>(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedDomain) {
      navigate(`/project/new/intake/form?domain=${selectedDomain}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Intake Specific Navbar */}
      <nav className="h-14 bg-[#134E4A] flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center space-x-6">
          <Logo size="sm" variant="light" useSecondary={true} />
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span className="text-white/50">New Project</span>
            <span className="text-white/30">&gt;</span>
            <span className="text-white">Select Domain</span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <button className="text-white/60 hover:text-white text-sm font-medium transition-colors">Projects</button>
          <button className="text-white text-sm font-bold transition-colors border-b-2 border-white pb-1 mt-1">Domains</button>
          <button className="text-white/60 hover:text-white text-sm font-medium transition-colors">Infrastructure</button>
          <button className="text-white/60 hover:text-white text-sm font-medium transition-colors">Settings</button>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-white/70 hover:text-white transition-colors">
            <Bell size={20} />
          </button>
          <button className="text-white/70 hover:text-white transition-colors">
            <HelpCircle size={20} />
          </button>
          <div className="flex items-center space-x-2 pl-2 cursor-pointer">
            <Avatar name="Maryam Farooq" size="sm" className="bg-[#34D399] text-[#134E4A]" />
            <ChevronDown size={14} className="text-white/50" />
          </div>
        </div>
      </nav>

      {/* 5-Step Stepper */}
      <div className="bg-white border-b border-slate-200 py-4 shadow-sm">
        <Stepper steps={INTAKE_STEPS} currentStep={1} />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-16 px-6">
        <div className="max-w-2xl text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 font-poppins mb-4 tracking-tight">
            What type of business are you building for?
          </h1>
          <p className="text-slate-500 font-inter text-lg">
            Your selection shapes every question, template, and generated screen for the entire workflow system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Clinic Card */}
          <div 
            onClick={() => setSelectedDomain('clinic')}
            className={cn(
              "relative bg-white border-2 rounded-3xl p-10 cursor-pointer transition-all duration-300 group",
              selectedDomain === 'clinic' 
                ? "border-[#0F766E] shadow-xl shadow-teal-900/10 scale-[1.02]" 
                : "border-slate-100 hover:border-slate-300 hover:shadow-lg"
            )}
          >
            {selectedDomain === 'clinic' && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-3 -right-3 w-8 h-8 bg-[#0F766E] rounded-full flex items-center justify-center text-white border-4 border-[#F8FAFC]"
              >
                <Check size={16} strokeWidth={4} />
              </motion.div>
            )}

            <div className="h-16 w-16 rounded-2xl bg-[#CCFBF1] flex items-center justify-center text-[#0F766E] mb-6 transition-transform group-hover:scale-110">
              <Stethoscope size={32} />
            </div>

            <h3 className="text-2xl font-bold text-slate-800 font-poppins mb-6">Medical Clinic</h3>
            
            <ul className="space-y-4">
              <li className="flex items-center space-x-3 text-sm text-slate-600 font-medium">
                <div className="h-5 w-5 rounded-full bg-teal-50 flex items-center justify-center text-[#34D399]">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>Appointments & Patient Management</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-slate-600 font-medium">
                <div className="h-5 w-5 rounded-full bg-teal-50 flex items-center justify-center text-[#34D399]">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>Consultation Records</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-slate-600 font-medium">
                <div className="h-5 w-5 rounded-full bg-teal-50 flex items-center justify-center text-[#34D399]">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>Fee & Follow-up Tracking</span>
              </li>
            </ul>
          </div>

          {/* School Card */}
          <div 
            onClick={() => setSelectedDomain('school')}
            className={cn(
              "relative bg-white border-2 rounded-3xl p-10 cursor-pointer transition-all duration-300 group",
              selectedDomain === 'school' 
                ? "border-[#4F46E5] shadow-xl shadow-indigo-900/10 scale-[1.02]" 
                : "border-slate-100 hover:border-slate-300 hover:shadow-lg"
            )}
          >
            {selectedDomain === 'school' && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-3 -right-3 w-8 h-8 bg-[#4F46E5] rounded-full flex items-center justify-center text-white border-4 border-[#F8FAFC]"
              >
                <Check size={16} strokeWidth={4} />
              </motion.div>
            )}

            <div className="h-16 w-16 rounded-2xl bg-[#EDE9FE] flex items-center justify-center text-[#4F46E5] mb-6 transition-transform group-hover:scale-110">
              <GraduationCap size={32} />
            </div>

            <h3 className="text-2xl font-bold text-slate-800 font-poppins mb-6">Educational School</h3>
            
            <ul className="space-y-4">
              <li className="flex items-center space-x-3 text-sm text-slate-600 font-medium">
                <div className="h-5 w-5 rounded-full bg-indigo-50 flex items-center justify-center text-[#818CF8]">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>Admissions & Enrollment</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-slate-600 font-medium">
                <div className="h-5 w-5 rounded-full bg-indigo-50 flex items-center justify-center text-[#818CF8]">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>Student Records</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-slate-600 font-medium">
                <div className="h-5 w-5 rounded-full bg-indigo-50 flex items-center justify-center text-[#818CF8]">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>Fee Plans & Interviews</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center">
          <Button 
            disabled={!selectedDomain}
            onClick={handleContinue}
            className="px-20 h-14 rounded-2xl text-lg font-bold shadow-xl shadow-teal-900/10 transition-all active:scale-95 disabled:opacity-30"
          >
            Continue
          </Button>
          <p className="mt-6 text-sm text-slate-400 font-medium">You can change this later in Project Settings</p>
        </div>
      </main>
    </div>
  );
};

export default DomainSelectionPage;
