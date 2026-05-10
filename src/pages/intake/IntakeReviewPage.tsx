import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../../components/shared/Logo';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
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
  ArrowRight
} from 'lucide-react';

const IntakeReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const handleNext = () => {
    navigate(`/project/${projectId || 'new'}/documents`);
  };

  const handleBack = () => {
    navigate(`/project/${projectId || 'new'}/intake/story`);
  };

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
                    <p className="text-sm text-slate-500">312 words captured</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                  <CheckCircle2 size={14} />
                  <span>Complete</span>
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
                    <p className="text-sm text-slate-500">3 roles: Receptionist, Doctor, Manager</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                  <CheckCircle2 size={14} />
                  <span>Complete</span>
                </div>
              </div>

              {/* Row 3: Data */}
              <div className="flex items-center justify-between py-4 border-b border-slate-100">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
                    <BarChart2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Data & Tracking</h3>
                    <p className="text-sm text-slate-500">3 stages, 12 fields captured</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                  <CheckCircle2 size={14} />
                  <span>Complete</span>
                </div>
              </div>

              {/* Row 4: Rules */}
              <div className="flex items-center justify-between py-4 border-b border-slate-100">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
                    <Scale size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Business Rules</h3>
                    <p className="text-sm text-slate-500">1 rule captured — consider adding more for better results</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-100">
                  <AlertTriangle size={14} />
                  <span>Good — can improve</span>
                </div>
              </div>

              {/* Row 5: Forms */}
              <div className="flex items-center justify-between py-4 border-b border-slate-100">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
                    <ClipboardList size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Structured Form Answers</h3>
                    <p className="text-sm text-slate-500">Notification channels not selected</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                    <XCircle size={14} />
                    <span>Incomplete</span>
                  </div>
                  <button className="text-[#0F766E] text-sm font-semibold hover:underline">Fix This →</button>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex gap-4 mt-6">
              <div className="bg-slate-50 rounded-xl p-4 flex-1 text-center">
                <div className="font-bold text-slate-800">12 data fields</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">CAPTURED</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 flex-1 text-center">
                <div className="font-bold text-slate-800">3 roles</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">IDENTIFIED</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 flex-1 text-center">
                <div className="font-bold text-slate-800">1 business rule</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">DEFINED</div>
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
              className="h-14 px-8 rounded-2xl bg-gradient-to-r from-[#0F766E] to-[#4F46E5] text-white font-bold flex items-center space-x-3 shadow-xl shadow-teal-900/10 transition-transform active:scale-[0.98]"
            >
              <span>Send to AI & Build My Blueprint</span>
              <ArrowRight size={20} />
            </Button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default IntakeReviewPage;
