import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Logo } from '../../components/shared/Logo';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import intakeService from '../../services/intakeService';
import { 
  Bell, 
  BookOpen, 
  Users, 
  BarChart2, 
  Scale, 
  ClipboardList, 
  CheckCircle2, 
  AlertTriangle,
  XCircle,
  Info,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../utils/classNames';

const IntakeReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [assembling, setAssembling] = useState(false);

  // Fetch intake bundle data
  const { data: bundle, isLoading } = useQuery({
    queryKey: ['intakeBundle', projectId],
    queryFn: () => intakeService.getIntake(projectId!),
    enabled: !!projectId,
  });

  const assembleMutation = useMutation({
    mutationFn: () => intakeService.assembleBundle(projectId!),
    onSuccess: (data) => {
      if (data.isValidated) {
        toast.success('Workflow bundle assembled successfully!');
        navigate(`/project/${projectId}/generating`);
      } else {
        toast.error('Validation failed. Please check the errors.');
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to assemble bundle';
      toast.error(msg);
    }
  });

  const handleNext = async () => {
    assembleMutation.mutate();
  };

  const handleBack = () => {
    navigate(`/project/${projectId}/intake/story`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F766E]" />
      </div>
    );
  }

  const wordCount = bundle?.bundleJson?.metadata?.totalWordCount || 0;
  const rolesCount = (bundle?.screen2PeopleRoles?.match(/\b(receptionist|doctor|nurse|manager|admin|teacher|principal|staff|cashier|coordinator|head|officer)\b/gi) || []).length;
  const isFormComplete = bundle?.status !== 'draft';
  const screensCompleted = bundle?.completedScreens?.length || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col overflow-hidden">
      {/* Header */}
      <nav className="h-14 bg-[#134E4A] flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center space-x-6">
          <Logo size="sm" variant="light" useSecondary={true} />
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span className="text-white/50">New Project</span>
            <span className="text-white/30">&gt;</span>
            <span className="text-white">Review</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-white/70 hover:text-white">
            <Bell size={20} />
          </button>
          <Avatar name="Maryam Farooq" size="sm" className="bg-[#34D399] text-[#134E4A]" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div>
            <h1 className="text-[28px] font-bold text-slate-900 font-poppins leading-tight mb-2">Review Before We Build Your App</h1>
            <p className="text-slate-500 font-inter">
              Here is everything we collected. Fix any issues before we start generating your workflow blueprint.
            </p>
          </div>

          {assembleMutation.data?.validationErrors && assembleMutation.data.validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-center space-x-2 text-red-800 font-bold">
                <AlertCircle size={20} />
                <span>Validation Errors Detected</span>
              </div>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {assembleMutation.data.validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
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
                  rolesCount >= 2 ? "bg-green-50 text-green-700 border-green-100" : "bg-amber-50 text-amber-700 border-amber-100"
                )}>
                  {rolesCount >= 2 ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                  <span>{rolesCount >= 2 ? 'Complete' : 'Needs More Info'}</span>
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
              <div className="bg-slate-50 rounded-xl p-4 flex-1 text-center">
                <div className="font-bold text-slate-800">{rolesCount} roles</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">IDENTIFIED</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 flex-1 text-center">
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

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button 
              onClick={handleBack}
              className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center"
            >
              ← Edit My Intake
            </button>
            
            <Button 
              onClick={handleNext}
              disabled={assembleMutation.isPending}
              className="h-14 px-8 rounded-2xl bg-gradient-to-r from-[#0F766E] to-[#4F46E5] text-white font-bold flex items-center space-x-3 shadow-xl shadow-teal-900/10 transition-transform active:scale-[0.98] disabled:opacity-70"
            >
              {assembleMutation.isPending ? (
                <><Loader2 className="animate-spin" size={20} /> <span>Assembling...</span></>
              ) : (
                <>
                  <span>Send to AI & Build My Blueprint</span>
                  <ArrowRight size={20} />
                </>
              )}
            </Button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default IntakeReviewPage;
