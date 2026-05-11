import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Stethoscope, GraduationCap, Sparkles } from 'lucide-react';
import { useCreateProject } from '../../../hooks/useProjects';
import type { ProjectDomain } from '../../../types/project.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialDomain?: 'clinic' | 'school' | null;
}

export const CreateProjectModal = ({ isOpen, onClose, initialDomain }: Props) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [domain, setDomain] = useState<ProjectDomain | null>(initialDomain || null);
  const [nameError, setNameError] = useState('');

  // Update domain if initialDomain changes
  React.useEffect(() => {
    if (initialDomain) setDomain(initialDomain);
  }, [initialDomain]);

  const { mutate: createProject, isPending } = useCreateProject();

  const handleSubmit = () => {
    // Validate
    if (!name.trim()) {
      setNameError('Project name is required.');
      return;
    }
    if (name.trim().length < 3) {
      setNameError('Project name must be at least 3 characters.');
      return;
    }
    if (!domain) {
      return; // Button is disabled anyway
    }

    setNameError('');

    // Create project in MongoDB via React Query mutation
    createProject(
      { name: name.trim(), domain },
      {
        onSuccess: (response) => {
          const project = response.data.data?.project;
          const projectId = project?.id || project?._id;
          onClose();
          setName('');
          setDomain(null);
          // Navigate to intake form for new project
          navigate(`/project/${projectId}/intake/form`);
        },
        onError: (err: any) => {
          const code = err.response?.data?.code;
          if (code === 'DUPLICATE_NAME') {
            setNameError('You already have a project with this name.');
          }
        },
      }
    );
  };

  const handleClose = () => {
    if (isPending) return; // Prevent closing during submission
    setName('');
    setDomain(null);
    setNameError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[520px] 
                      p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Close */}
        <button
          onClick={handleClose}
          disabled={isPending}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 
                     hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-teal-50 rounded-xl p-2.5">
            <Sparkles className="w-5 h-5 text-[#0F766E]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-poppins">
              Start a New Project
            </h2>
            <p className="text-sm text-slate-500">
              Give it a name and choose your business type.
            </p>
          </div>
        </div>

        {/* Project Name */}
        <div className="mb-5">
          <label className="block text-xs font-semibold uppercase tracking-wide 
                            text-slate-600 mb-1.5">
            Project Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value.slice(0, 50));
                if (nameError) setNameError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && domain && handleSubmit()}
              placeholder="e.g. My New Workflow"
              className={`w-full h-11 px-4 rounded-xl border text-sm text-slate-800
                         placeholder:text-slate-400 outline-none transition-all
                         ${nameError
                           ? 'border-red-400 ring-2 ring-red-100'
                           : 'border-slate-200 focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100'
                         }`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 
                             text-xs text-slate-400">
              {name.length}/50
            </span>
          </div>
          {nameError && (
            <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
              <span>⚠</span> {nameError}
            </p>
          )}
        </div>

        {/* Business Type */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wide 
                            text-slate-600 mb-2">
            Business Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Clinic */}
            <button
              type="button"
              onClick={() => setDomain('clinic')}
              className={`relative p-4 rounded-xl border-2 text-left transition-all
                ${domain === 'clinic'
                  ? 'border-[#0F766E] bg-teal-50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
            >
              {domain === 'clinic' && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-[#0F766E] 
                                 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </span>
              )}
              <div className="bg-teal-100 rounded-lg p-2 w-10 h-10 
                              flex items-center justify-center mb-3">
                <Stethoscope className="w-5 h-5 text-teal-700" />
              </div>
              <p className="font-semibold text-slate-800 text-sm">Clinic</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Appointments & patient management
              </p>
            </button>

            {/* School */}
            <button
              type="button"
              onClick={() => setDomain('school')}
              className={`relative p-4 rounded-xl border-2 text-left transition-all
                ${domain === 'school'
                  ? 'border-[#4F46E5] bg-indigo-50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
            >
              {domain === 'school' && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-[#4F46E5] 
                                 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </span>
              )}
              <div className="bg-indigo-100 rounded-lg p-2 w-10 h-10 
                              flex items-center justify-center mb-3">
                <GraduationCap className="w-5 h-5 text-indigo-700" />
              </div>
              <p className="font-semibold text-slate-800 text-sm">School</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Admissions & enrollment
              </p>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleClose}
            disabled={isPending}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 
                       border border-slate-200 rounded-xl hover:bg-slate-50 
                       transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !domain || isPending || name.trim().length < 3}
            className="flex items-center gap-2 bg-[#0F766E] hover:bg-[#0D6B63] 
                       disabled:bg-slate-300 disabled:cursor-not-allowed
                       text-white px-6 py-2.5 rounded-xl text-sm font-semibold 
                       transition-colors min-w-[140px] justify-center"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent 
                                rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              'Create Project →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
