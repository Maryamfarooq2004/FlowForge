import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Logo } from '../../components/shared/Logo';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import intakeService from '../../services/intakeService';
import { useIntakeBundle, useValidateIntake } from '../../hooks/useIntake';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Bell, 
  BookOpen, 
  Users, 
  BarChart2, 
  ClipboardList, 
  CheckCircle2, 
  AlertTriangle,
  XCircle,
  Info,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../utils/classNames';
import { useAuthStore } from '../../store/authStore';

const IntakeReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuthStore();

  const queryClient = useQueryClient();

  // Fetch intake bundle data from MongoDB
  const { data: bundle, isLoading } = useIntakeBundle(projectId);

  // FE2.11 — run the consistency check up-front so issues show before Convert.
  const { data: validation } = useValidateIntake(projectId);
  const [assembleErrors, setAssembleErrors] = useState<string[]>([]);

  const errors = assembleErrors.length ? assembleErrors : (validation?.errors ?? []);
  const warnings = validation?.warnings ?? [];

  const assembleMutation = useMutation({
    mutationFn: () => intakeService.assembleBundle(projectId!),
    onSuccess: (data) => {
      if (data?.warnings?.length) {
        toast(`Converted with ${data.warnings.length} note(s) you can review later.`);
      }
      toast.success('Intake converted to workflow specification!');
      navigate(`/project/${projectId}/spec`);
    },
    onError: (error: any) => {
      if (error.response?.status === 422) {
        setAssembleErrors(error.response?.data?.errors ?? []);
        queryClient.invalidateQueries({ queryKey: ['intake', projectId, 'validate'] });
        toast.error('Please fix the highlighted issues before converting.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to assemble bundle');
      }
    }
  });

  const handleNext = () => {
    setAssembleErrors([]);
    assembleMutation.mutate();
  };

  const handleBack = () => {
    navigate(`/project/${projectId}/intake/rules`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F766E]" />
      </div>
    );
  }

  const wordCount = bundle?.guidedScreens?.reduce((acc, s) => acc + (s.content || '').split(/\s+/).filter(Boolean).length, 0) || 0;
  const screen2Data = bundle?.guidedScreens?.find(s => s.screen === 2);
  const rolesScreenComplete = screen2Data?.isComplete || false;
  
  // If user hasn't confirmed items, show the count of detected items instead of 0
  const rolesCount = (screen2Data?.confirmedItems?.length || 0) > 0 
    ? (screen2Data?.confirmedItems?.length || 0)
    : (screen2Data?.detectedItems?.length || 0);

  const isFormComplete = bundle?.structuredFormComplete;
  const screensCompleted = bundle?.guidedScreens?.filter(s => s.isComplete).length || 0;
  const allScreensComplete = screensCompleted === 4;

  return (
    <div className="bg-[#F8FAFC]">
      {/* Main Content */}
      <div className="max-w-3xl mx-auto space-y-8 py-8">
        
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 font-poppins leading-tight mb-2">Review Before We Build Your App</h1>
          <p className="text-slate-500 font-inter text-sm">
            Here is everything we collected. Fix any issues before we start generating your workflow blueprint.
          </p>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-3">
            <div className="flex items-center space-x-2 text-red-800 font-bold">
              <AlertCircle size={20} />
              <span>Fix these before converting</span>
            </div>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-3">
            <div className="flex items-center space-x-2 text-amber-800 font-bold">
              <AlertTriangle size={20} />
              <span>Suggestions (optional — you can still convert)</span>
            </div>
            <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
              {warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h2 className="font-poppins text-[22px] font-bold text-[#0F766E] mb-6">Intake Summary</h2>

          <div className="space-y-0">
            {/* Row 1: Story */}
            <div className="flex items-center justify-between py-4 border-b border-slate-100">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Workflow Story</h3>
                  <p className="text-sm text-slate-500">{wordCount} words captured</p>
                </div>
              </div>
              <div className={cn(
                "flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                screensCompleted >= 1 ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-50 text-slate-500 border-slate-100"
              )}>
                {screensCompleted >= 1 ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                <span>{screensCompleted >= 1 ? 'Complete' : 'Incomplete'}</span>
              </div>
            </div>

            {/* Row 2: Roles */}
            <div className="flex items-center justify-between py-4 border-b border-slate-100">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">People & Roles</h3>
                  <p className="text-sm text-slate-500">{rolesCount} roles identified</p>
                </div>
              </div>
              <div className={cn(
                "flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                rolesScreenComplete ? "bg-green-50 text-green-700 border-green-100" : "bg-amber-50 text-amber-700 border-amber-100"
              )}>
                {rolesScreenComplete ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                <span>{rolesScreenComplete ? 'Complete' : 'Needs More Info'}</span>
              </div>
            </div>

            {/* Row 3: Data */}
            <div className="flex items-center justify-between py-4 border-b border-slate-100">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
                  <BarChart2 size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Workflow Progress</h3>
                  <p className="text-sm text-slate-500">{screensCompleted} of 4 screens completed</p>
                </div>
              </div>
              <div className={cn(
                "flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                screensCompleted === 4 ? "bg-green-50 text-green-700 border-green-100" : "bg-amber-50 text-amber-700 border-amber-100"
              )}>
                {screensCompleted === 4 ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                <span>{screensCompleted === 4 ? 'Complete' : 'Partial'}</span>
              </div>
            </div>

            {/* Row 5: Forms */}
            <div className="flex items-center justify-between py-4 border-b border-slate-100">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Structured Form</h3>
                  <p className="text-sm text-slate-500">{isFormComplete ? 'Basic info captured' : 'Form not yet submitted'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                  isFormComplete ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"
                )}>
                  {isFormComplete ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  <span>{isFormComplete ? 'Complete' : 'Incomplete'}</span>
                </div>
                {!isFormComplete && (
                  <button 
                    onClick={() => navigate(`/project/${projectId}/intake/form`)}
                    className="text-[#0F766E] text-sm font-semibold hover:underline"
                  >
                    Fix This →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex gap-4 mt-6">
            <div className="bg-slate-50 rounded-xl p-4 flex-1 text-center border border-slate-100">
              <div className="font-bold text-slate-800">{rolesCount} roles</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">IDENTIFIED</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 flex-1 text-center border border-slate-100">
              <div className="font-bold text-slate-800">{screensCompleted}/4 steps</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">COMPLETED</div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mt-6 flex gap-3">
            <Info size={20} className="text-[#0F766E] shrink-0 mt-0.5" />
            <p className="text-sm text-teal-900 font-medium leading-relaxed">
              Our AI will now read everything you entered and build a draft of your app structure. You will be able to review and change everything before anything is generated.
            </p>
          </div>
        </div>

        {/* Optional: enrich from existing documents */}
        <button
          onClick={() => navigate(`/project/${projectId}/documents`)}
          className="w-full bg-white rounded-2xl border border-dashed border-slate-300 p-5 flex items-center justify-between hover:border-teal-400 hover:bg-teal-50/30 transition-colors text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#0F766E]">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Add existing documents (optional)</h3>
              <p className="text-sm text-slate-500">Upload an Excel register, CSV, or PDF — we'll extract fields to enrich your spec.</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-slate-400" />
        </button>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-4 pb-12">
          <button 
            onClick={handleBack}
            className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center"
          >
            ← Edit My Intake
          </button>
          
          <Button
            onClick={handleNext}
            disabled={assembleMutation.isPending || !allScreensComplete || !isFormComplete || errors.length > 0}
            title={
              !isFormComplete ? 'Complete the close-ended form first'
              : !allScreensComplete ? 'Complete all 4 guided screens before building your blueprint'
              : errors.length > 0 ? 'Resolve the issues above before converting'
              : ''
            }
            className="h-14 px-8 rounded-2xl bg-gradient-to-r from-[#0F766E] to-[#4F46E5] text-white font-bold flex items-center space-x-3 shadow-xl shadow-teal-900/10 transition-transform active:scale-[0.98] disabled:opacity-70"
          >
            {assembleMutation.isPending ? (
              <><Loader2 className="animate-spin" size={20} /> <span>Converting...</span></>
            ) : (
              <>
                <span>Convert intake into workflowspec document</span>
                <ArrowRight size={20} />
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default IntakeReviewPage;
