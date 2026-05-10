import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sparkles, Building2, School, CheckCircle2, ArrowRight } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../utils/classNames';

const createProjectSchema = z.object({
  name: z.string()
    .min(1, 'Project name is required')
    .max(50, 'Max 50 characters'),
  domain: z.enum(['clinic', 'school']),
});

type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      domain: undefined,
    }
  });

  const selectedDomain = watch('domain');
  const projectName = watch('name');

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: CreateProjectFormValues) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Project created:', data);
    handleClose();
    navigate('/project/new/domain');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[520px] p-0 overflow-visible">
      <div className="p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-teal-50 rounded-xl p-2 text-[#0F766E]">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 font-poppins">Start a New Project</h3>
            <p className="text-sm text-slate-500">Give your project a name, then choose your business type.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-1">
            <Input
              label="Project Name"
              placeholder="e.g. Al-Shifa Clinic App"
              {...register('name')}
              variant={errors.name ? 'error' : 'default'}
              errorMessage={errors.name?.message}
            />
            <div className="flex justify-end">
              <span className={cn(
                "text-[10px] font-bold tracking-widest uppercase",
                projectName?.length > 45 ? "text-red-500" : "text-slate-300"
              )}>
                {projectName?.length || 0} / 50
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Business Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setValue('domain', 'clinic', { shouldValidate: true })}
                className={cn(
                  "relative p-4 rounded-xl border-2 text-left transition-all duration-200 group",
                  selectedDomain === 'clinic' 
                    ? "border-[#0F766E] bg-teal-50 shadow-sm shadow-teal-700/5" 
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg w-fit mb-4 transition-colors",
                  selectedDomain === 'clinic' ? "bg-[#0F766E] text-white" : "bg-teal-50 text-[#0F766E]"
                )}>
                  <Building2 size={20} />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Clinic</h4>
                <p className="text-[11px] text-slate-500 leading-tight">Appointments & patient management</p>
                
                {selectedDomain === 'clinic' && (
                  <div className="absolute top-2 right-2 text-[#0F766E]">
                    <CheckCircle2 size={16} fill="currentColor" className="text-white" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setValue('domain', 'school', { shouldValidate: true })}
                className={cn(
                  "relative p-4 rounded-xl border-2 text-left transition-all duration-200 group",
                  selectedDomain === 'school' 
                    ? "border-[#4F46E5] bg-indigo-50 shadow-sm shadow-indigo-700/5" 
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg w-fit mb-4 transition-colors",
                  selectedDomain === 'school' ? "bg-[#4F46E5] text-white" : "bg-indigo-50 text-[#4F46E5]"
                )}>
                  <School size={20} />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">School</h4>
                <p className="text-[11px] text-slate-500 leading-tight">Admissions & enrollment management</p>
                
                {selectedDomain === 'school' && (
                  <div className="absolute top-2 right-2 text-[#4F46E5]">
                    <CheckCircle2 size={16} fill="currentColor" className="text-white" />
                  </div>
                )}
              </button>
            </div>
            {errors.domain && (
              <p className="text-xs text-red-500 mt-2 font-medium">{errors.domain.message}</p>
            )}
          </div>

          <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
            <button type="button" onClick={handleClose} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
              Cancel
            </button>
            <Button 
              type="submit"
              isLoading={isSubmitting}
              className="px-8 shadow-lg shadow-teal-700/20"
            >
              Create Project <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-bold text-slate-300 tracking-[0.2em] uppercase">FlowForge Shell v2.4</p>
          <div className="flex items-center justify-center space-x-4 mt-2">
            <button className="text-[10px] text-slate-300 hover:text-slate-400 font-medium">Privacy Policy</button>
            <button className="text-[10px] text-slate-300 hover:text-slate-400 font-medium">Terms of Service</button>
            <button className="text-[10px] text-slate-300 hover:text-slate-400 font-medium">Help Center</button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
