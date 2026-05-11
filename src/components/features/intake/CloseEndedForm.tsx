import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Loader2,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../../utils/classNames';
import intakeService from '../../../services/intakeService';

interface Question {
  id: string;
  section: string;
  question: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  yesLabel?: string;
  noLabel?: string;
}

interface CloseEndedFormProps {
  projectId: string;
  category: 'clinic' | 'school';
  questions: Question[];
  initialValues?: Record<string, any>;
}

export const CloseEndedForm: React.FC<CloseEndedFormProps> = ({
  projectId,
  category,
  questions,
  initialValues = {}
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState<Record<string, any>>(initialValues);
  const [activeSection, setActiveSection] = useState(questions[0].section);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const sections = useMemo(() => {
    return Array.from(new Set(questions.map(q => q.section)));
  }, [questions]);

  // Sync with initial values when they load
  useEffect(() => {
    if (Object.keys(initialValues).length > 0) {
      setFormValues(initialValues);
    }
  }, [initialValues]);

  // Auto-save logic
  const saveMutation = useMutation({
    mutationFn: (data: Record<string, any>) => (intakeService as any).saveStructuredForm(projectId, data),
    onSuccess: () => {
      setLastSaved(new Date());
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['intakeBundle', projectId] });
    }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      if (isDirty && !saveMutation.isPending) {
        saveMutation.mutate(formValues);
      }
    }, 15000); // Auto-save every 15s
    return () => clearInterval(timer);
  }, [isDirty, formValues, saveMutation.isPending]);

  const updateField = (id: string, value: any) => {
    setFormValues(prev => ({ ...prev, [id]: value }));
    setIsDirty(true);
  };

  const toggleMultiSelect = (id: string, option: string) => {
    const current = formValues[id] || [];
    const updated = current.includes(option)
      ? current.filter((i: string) => i !== option)
      : [...current, option];
    updateField(id, updated);
  };

  const completedSections = useMemo(() => {
    return sections.filter(section => {
      const sectionQuestions = questions.filter(q => q.section === section && q.required);
      return sectionQuestions.every(q => {
        const val = formValues[q.id];
        if (Array.isArray(val)) return val.length > 0;
        return val !== undefined && val !== '' && val !== null;
      });
    });
  }, [formValues, questions, sections]);

  const completionPercent = useMemo(() => {
    const requiredFields = questions.filter(q => q.required);
    const answeredRequired = requiredFields.filter(q => {
      const val = formValues[q.id];
      if (Array.isArray(val)) return val.length > 0;
      return val !== undefined && val !== '' && val !== null;
    });
    return Math.round((answeredRequired.length / requiredFields.length) * 100);
  }, [formValues, questions]);

  const currentQuestions = questions.filter(q => q.section === activeSection);

  const handleNext = async () => {
    const currentIndex = sections.indexOf(activeSection);
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Final Submit
      try {
        await saveMutation.mutateAsync(formValues);
        toast.success('Form saved successfully!');
        navigate(`/project/${projectId}/intake/story`);
      } catch (error) {
        toast.error('Failed to save form. Please try again.');
      }
    }
  };

  const handleBack = () => {
    const currentIndex = sections.indexOf(activeSection);
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Progress Bar Top */}
      <div className="fixed top-14 left-0 right-0 h-1 bg-slate-100 z-50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${completionPercent}%` }}
          className="h-full bg-[#0F766E] transition-all duration-500"
        />
      </div>

      <div className="max-w-7xl mx-auto w-full flex-1 flex pt-20 pb-32 px-6">
        {/* Left Sidebar Navigator */}
        <div className="hidden lg:block w-72 pr-12 border-r border-slate-100">
          <div className="sticky top-28 space-y-1">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Sections
                </span>
                <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-widest">
                  {completionPercent}% Done
                </span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-100 w-full" />
              </div>
            </div>

            {sections.map((section, i) => {
              const isCompleted = completedSections.includes(section);
              const isActive = activeSection === section;
              
              return (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-left transition-all group",
                    isActive
                      ? "bg-teal-50 text-[#0F766E] font-semibold"
                      : isCompleted
                      ? "text-slate-500 hover:bg-slate-50"
                      : "text-slate-400 hover:bg-slate-50"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors",
                    isCompleted
                      ? "bg-[#0F766E] text-white"
                      : isActive
                      ? "bg-teal-100 text-[#0F766E] border border-teal-200"
                      : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                  )}>
                    {isCompleted ? <Check size={12} /> : i + 1}
                  </div>
                  <span className="truncate">{section}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Form Content */}
        <div className="flex-1 lg:pl-16 max-w-3xl">
          <div className="mb-10">
            <h2 className="text-sm font-bold text-[#0F766E] uppercase tracking-widest mb-2">
              {activeSection}
            </h2>
            <h3 className="text-3xl font-bold text-slate-900 font-poppins">
              Project Intake Form
            </h3>
          </div>

          <div className="space-y-12">
            {currentQuestions.map((q) => (
              <div key={q.id} className="space-y-4">
                <label className="block">
                  <span className="text-[15px] font-semibold text-slate-800 leading-relaxed">
                    {q.question}
                    {q.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                </label>

                {q.type === 'text' && (
                  <input
                    type="text"
                    placeholder={q.placeholder}
                    value={formValues[q.id] || ''}
                    onChange={(e) => updateField(q.id, e.target.value)}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px]
                               focus:outline-none focus:ring-2 focus:ring-[#0F766E]/10 focus:border-[#0F766E]
                               focus:bg-white transition-all"
                  />
                )}

                {q.type === 'select' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options?.map((option) => (
                      <button
                        key={option}
                        onClick={() => updateField(q.id, option)}
                        className={cn(
                          "px-4 py-3.5 rounded-xl border text-[13px] text-left transition-all",
                          formValues[q.id] === option
                            ? "border-[#0F766E] bg-teal-50 text-[#0F766E] font-semibold shadow-sm"
                            : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === 'multi_checkbox' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options?.map((option) => {
                      const selected = (formValues[q.id] || []).includes(option);
                      return (
                        <button
                          key={option}
                          onClick={() => toggleMultiSelect(q.id, option)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3.5 rounded-xl border text-[13px] text-left transition-all",
                            selected
                              ? "border-[#0F766E] bg-teal-50 text-[#0F766E] shadow-sm"
                              : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all",
                            selected ? "border-[#0F766E] bg-[#0F766E]" : "border-slate-300"
                          )}>
                            {selected && <Check size={12} className="text-white" />}
                          </div>
                          <span className={selected ? "font-semibold" : ""}>{option}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type === 'yes_no_detail' && (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: 'yes', label: q.yesLabel },
                      { value: 'no', label: q.noLabel },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => updateField(q.id, opt.value)}
                        className={cn(
                          "p-5 rounded-2xl border-2 text-[13px] text-left transition-all",
                          formValues[q.id] === opt.value
                            ? "border-[#0F766E] bg-teal-50 shadow-sm"
                            : "border-slate-100 bg-slate-50 hover:border-slate-200"
                        )}
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 mb-3 flex items-center justify-center transition-all",
                          formValues[q.id] === opt.value
                            ? "border-[#0F766E] bg-[#0F766E]"
                            : "border-slate-300 bg-white"
                        )}>
                          {formValues[q.id] === opt.value && <Check size={12} className="text-white" />}
                        </div>
                        <p className={cn(
                          "leading-snug",
                          formValues[q.id] === opt.value ? "text-[#0F766E] font-bold" : "text-slate-600 font-medium"
                        )}>
                          {opt.label}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-100 z-40 px-6">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={handleBack}
              disabled={sections.indexOf(activeSection) === 0}
              className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-700 disabled:opacity-0 transition-all"
            >
              <ChevronLeft size={20} />
              Back
            </button>
            
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
              {saveMutation.isPending ? (
                <><Loader2 size={12} className="animate-spin" /> Saving changes...</>
              ) : lastSaved ? (
                <><Check size={12} className="text-green-500" /> Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
              ) : (
                <><Clock size={12} /> Auto-save active</>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => saveMutation.mutate(formValues)}
              className="h-11 px-6 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all flex items-center gap-2"
            >
              <Save size={18} />
              Save Draft
            </button>
            <button
              onClick={handleNext}
              className="h-11 px-8 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"
            >
              {sections.indexOf(activeSection) === sections.length - 1 ? 'Finish & Generate' : 'Next Section'}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
