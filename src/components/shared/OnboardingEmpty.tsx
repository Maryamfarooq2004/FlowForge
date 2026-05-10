import React from 'react';
import { motion } from 'framer-motion';
import { Hammer, MessageSquare, Sparkles, Rocket, Plus } from 'lucide-react';

interface OnboardingEmptyProps {
  onCreateProject: () => void;
  organizationType: 'clinic' | 'school';
}

export const OnboardingEmpty: React.FC<OnboardingEmptyProps> = ({ 
  onCreateProject, 
  organizationType 
}) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      
      {/* Animated illustration */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="w-24 h-24 bg-teal-50 rounded-3xl flex items-center justify-center mb-8 border border-teal-100"
      >
        <Hammer size={40} className="text-[#0F766E]" />
      </motion.div>

      {/* Headline */}
      <h2 className="text-2xl font-bold text-slate-900 font-poppins mb-3">
        Welcome to FlowForge
      </h2>
      
      {/* Subtitle — personalized with user's organization type */}
      <p className="text-slate-500 text-[15px] max-w-md leading-relaxed mb-10">
        You're all set. Let's turn your {organizationType === 'clinic' ? 'clinic' : 'school'}'s
        workflow into a working application — no coding needed.
      </p>

      {/* Steps preview */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-12 max-w-lg w-full">
        {[
          { num: '1', label: 'Describe your workflow', icon: MessageSquare },
          { num: '2', label: 'AI builds the blueprint', icon: Sparkles },
          { num: '3', label: 'Deploy your app', icon: Rocket },
        ].map((step, i) => (
          <React.Fragment key={step.num}>
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100
                              flex items-center justify-center mb-2">
                <step.icon size={18} className="text-[#0F766E]" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Step {step.num}
              </span>
              <span className="text-[13px] font-medium text-slate-700 mt-0.5">{step.label}</span>
            </div>
            {i < 2 && (
              <div className="hidden sm:block w-8 h-px bg-slate-200 flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onCreateProject}
        className="h-12 px-10 bg-slate-900 text-white text-[14px] font-semibold
                   rounded-md hover:bg-slate-800 transition-colors flex items-center gap-2"
      >
        <Plus size={16} />
        Create Your First Project
      </button>

      {/* Reassurance text */}
      <p className="text-[11px] text-slate-400 mt-6 tracking-wide">
        Takes about 5 minutes · No technical knowledge required
      </p>
    </div>
  );
};
