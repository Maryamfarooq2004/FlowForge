import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/classNames';

export type Step = {
  id: number;
  label: string;
};

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, className }) => {
  return (
    <div className={cn("w-full max-w-4xl mx-auto py-6", className)}>
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-200 -z-10" />
        
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isUpcoming = step.id > currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center flex-1 relative">
              {/* Connector Line (Progressive) */}
              {index > 0 && (
                <div 
                  className={cn(
                    "absolute top-4 -left-1/2 w-full h-0.5 -z-10",
                    step.id <= currentStep ? "bg-[#0F766E]" : "bg-slate-200"
                  )} 
                />
              )}

              {/* Step Circle */}
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                  isCompleted && "bg-[#0F766E] text-white",
                  isActive && "bg-[#0F766E] text-white ring-4 ring-[#0F766E]/20",
                  isUpcoming && "bg-white border-2 border-slate-300 text-slate-400"
                )}
              >
                {isCompleted ? <Check size={16} strokeWidth={3} /> : step.id}
              </div>

              {/* Label */}
              <span 
                className={cn(
                  "mt-3 text-[11px] uppercase tracking-wider font-bold transition-colors duration-300",
                  isActive ? "text-[#0F766E]" : "text-slate-400"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
