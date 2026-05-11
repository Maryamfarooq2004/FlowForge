import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../../components/shared/Logo';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/classNames';
import { 
  Bell, 
  Sparkles, 
  User, 
  Calendar, 
  Briefcase, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  AlertTriangle, 
  ChevronDown, 
  ArrowRight,
  Database,
  Activity,
  Users,
  BellRing,
  Loader2
} from 'lucide-react';
import { useProject } from '../../hooks/useProjects';

const BlueprintReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [activeSection, setActiveSection] = useState('track');

  const { data: project, isLoading } = useProject(projectId);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-[#0F766E]" /></div>;

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleApprove = () => {
    navigate(`/project/${projectId || 'new'}/alerts`);
  };

  return (
    <div className="bg-[#F8FAFC]">
      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8 items-start relative">
        
        {/* Left Jump Nav (Sticky) */}
        <aside className="w-full lg:w-48 shrink-0 lg:sticky lg:top-24 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">JUMP TO SECTION</h3>
          <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 lg:space-y-1 pb-2 lg:pb-0">
            {[
              { id: 'track', icon: <Database size={16} />, label: 'Track' },
              { id: 'work', icon: <Activity size={16} />, label: 'Work' },
              { id: 'roles', icon: <Users size={16} />, label: 'Roles' },
              { id: 'alerts', icon: <BellRing size={16} />, label: 'Alerts' },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeSection === item.id ? "bg-[#0F766E] text-white" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
            
            <div className="my-2 border-t border-slate-100" />
            
            <button 
              onClick={() => scrollTo('ai')}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-teal-700 bg-teal-50 hover:bg-teal-100"
              )}
            >
              <Sparkles size={16} className="text-teal-500" />
              <span>AI Suggestions</span>
            </button>
          </nav>
        </aside>

        {/* Center Scrollable Content */}
        <div className="flex-1 space-y-12 pb-32">
          
          {/* Hero Banner */}
          <div className="bg-teal-50 rounded-2xl p-8 border border-teal-100 flex items-start gap-5">
            <div className="bg-white rounded-xl p-3 shadow-sm shrink-0">
              <Sparkles className="text-teal-500" size={24} />
            </div>
            <div>
              <h1 className="font-poppins text-3xl lg:text-[36px] font-bold text-[#0F766E] leading-tight mb-2">
                The blueprint for <span className="text-slate-900">{project?.name || 'your project'}</span> is ready
              </h1>
              <p className="text-teal-900/70 text-lg max-w-3xl">
                Read through each section below. Everything is written in plain language to ensure the automation matches your needs perfectly.
              </p>
            </div>
          </div>

          {/* SECTION 1: Track */}
          <section id="track" className="scroll-mt-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-poppins text-2xl font-bold text-slate-900">What Your App Will Track</h2>
              <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-bold">4 Data Collections</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-teal-300 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-teal-50 p-2 rounded-lg text-teal-600"><User size={20} /></div>
                  <h3 className="font-semibold text-slate-800 text-lg">Patient Records</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    { name: 'Full Name', type: 'TEXT' },
                    { name: 'Phone Number', type: 'PHONE' },
                    { name: 'Age', type: 'NUMBER' },
                    { name: 'Medical History', type: 'RICH TEXT' },
                  ].map(field => (
                    <li key={field.name} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                      <span className="text-sm text-slate-700">{field.name}</span>
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{field.type}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-teal-300 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><Calendar size={20} /></div>
                  <h3 className="font-semibold text-slate-800 text-lg">Appointment Book</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    { name: 'Patient Name', type: 'LINK' },
                    { name: 'Date', type: 'DATE' },
                    { name: 'Time', type: 'TIME' },
                  ].map(field => (
                    <li key={field.name} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                      <span className="text-sm text-slate-700">{field.name}</span>
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{field.type}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-teal-300 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-amber-50 p-2 rounded-lg text-amber-600"><Briefcase size={20} /></div>
                  <h3 className="font-semibold text-slate-800 text-lg">Doctor Profiles</h3>
                </div>
                <p className="text-xs text-slate-400 ml-11">8 Fields configured</p>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-teal-300 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600"><CreditCard size={20} /></div>
                  <h3 className="font-semibold text-slate-800 text-lg">Payment Records</h3>
                </div>
                <p className="text-xs text-slate-400 ml-11">Billing & insurance</p>
              </div>
            </div>
          </section>

          {/* SECTION 2: Work */}
          <section id="work" className="scroll-mt-24 pt-8 border-t border-slate-200">
            <h2 className="font-poppins text-2xl font-bold text-slate-900 mb-6">How Work Moves Forward</h2>
            
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm overflow-x-auto">
              <div className="flex items-center min-w-max">
                
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">START</div>
                  <div className="px-6 py-4 rounded-xl border-2 border-slate-300 bg-white shadow-sm font-semibold text-slate-700 min-w-40 text-center">
                    Appointment Booked
                  </div>
                </div>

                <div className="px-4 text-slate-300"><ArrowRight size={24} /></div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">CONFIRM</div>
                  <div className="px-6 py-4 rounded-xl border-2 border-slate-400 bg-white shadow-sm font-semibold text-slate-700 min-w-40 text-center">
                    Appointment Confirmed
                  </div>
                </div>

                <div className="px-4 text-[#0F766E]"><ArrowRight size={24} /></div>

                {/* Step 3 (Current) */}
                <div className="relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#0F766E] uppercase tracking-widest">CLINIC VISIT</div>
                  <div className="px-6 py-4 rounded-xl border-2 border-[#0F766E] bg-teal-50 shadow-sm font-bold text-[#0F766E] min-w-40 text-center ring-4 ring-teal-500/10">
                    Patient Visited
                  </div>
                </div>

              </div>
              <p className="text-xs text-slate-400 mt-8 flex items-center gap-1.5">
                <span className="bg-slate-100 text-slate-500 rounded-full w-4 h-4 flex items-center justify-center font-serif italic text-[10px]">i</span>
                This timeline represents the linear path from lead to completion.
              </p>
            </div>
          </section>

          {/* SECTION 3: Roles */}
          <section id="roles" className="scroll-mt-24 pt-8 border-t border-slate-200">
            <h2 className="font-poppins text-2xl font-bold text-slate-900 mb-6">Who Can Do What</h2>
            
            <div className="space-y-6">
              {/* Receptionist */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-lg">RE</div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-xl">Receptionist</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Handles patient intake, scheduling, and basic record maintenance.</p>
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-2/3">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <tr>
                        <th className="pb-3 w-3/4">ACTION</th>
                        <th className="pb-3 w-1/4 text-center">PERMISSION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      <tr>
                        <td className="py-3 font-medium text-slate-700">Book Appointments</td>
                        <td className="py-3 text-center text-green-500 flex justify-center"><CheckCircle2 size={18} /></td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium text-slate-700">View Patient Records</td>
                        <td className="py-3 text-center text-green-400 flex justify-center"><CheckCircle2 size={18} /></td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium text-slate-700">Edit Diagnosis</td>
                        <td className="py-3 text-center text-red-400 flex justify-center"><XCircle size={18} /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Doctor */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-lg">DR</div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-xl">Doctor</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Full clinical access to patient records and medical histories.</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded text-[10px] font-bold border border-teal-100">Full Diagnosis Access</span>
                    <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded text-[10px] font-bold border border-teal-100">Prescription Control</span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold border border-blue-100">Admin Level: High</span>
                  </div>
                </div>
                
                <div className="w-full md:w-2/3 flex items-center justify-center">
                  <p className="text-sm text-slate-400 italic">Permissions configured automatically based on role profile.</p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Right Sticky Panel */}
        <aside className="w-80 shrink-0 sticky top-24 space-y-6 hidden xl:block" id="ai">
          
          {/* AI Suggestions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 bg-teal-50/50 hover:bg-teal-50 transition-colors">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-teal-800">🔥 AI Suggestions (2)</span>
              </div>
              <ChevronDown size={18} className="text-teal-600" />
            </button>
            <div className="p-4 space-y-4 border-t border-slate-100">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full py-1.5 mb-2 text-[10px] font-bold text-teal-600 hover:text-teal-800 uppercase tracking-widest border border-dashed border-teal-200 rounded-lg hover:bg-teal-50 transition-all"
              >
                ← Back to Main Spec
              </button>
              <div className="bg-white border border-teal-100 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-teal-400"></div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Add a Follow-up Date</h4>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">Suggested for 'Appointment Book' to improve patient retention.</p>
                <button className="text-xs font-bold text-teal-600 flex items-center space-x-1 hover:text-teal-800">
                  <span>Add to Spec</span>
                  <PlusCircle size={14} />
                </button>
              </div>

              <div className="bg-white border border-teal-100 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-teal-400"></div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Track Surgeon ID</h4>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">Better for clinical reporting in surgical departments.</p>
                <button className="text-xs font-bold text-teal-600 flex items-center space-x-1 hover:text-teal-800">
                  <span>Add to Spec</span>
                  <PlusCircle size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Review Needed */}
          <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 bg-amber-50 hover:bg-amber-100/50 transition-colors">
              <div className="flex items-center space-x-2">
                <AlertTriangle size={16} className="text-amber-600" />
                <span className="text-sm font-bold text-amber-800">Review Needed (1)</span>
              </div>
              <ChevronDown size={18} className="text-amber-600" />
            </button>
            <div className="p-4 border-t border-amber-100">
              <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 mb-1">Check 'WaiverApproved' field</h4>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">This field has no default value. We recommend setting it to 'False' by default.</p>
                <button className="text-xs font-bold text-amber-600 hover:underline">
                  Fix this now
                </button>
              </div>
            </div>
          </div>

          {/* Completion Status */}
          <div className="bg-[#0F766E] text-white rounded-2xl p-6 shadow-xl shadow-teal-900/10 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            
            <h3 className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-2">COMPLETION STATUS</h3>
            <div className="flex items-end space-x-3 mb-4">
              <span className="text-4xl font-bold font-poppins">80%</span>
              <span className="text-sm text-teal-100 font-medium mb-1">Ready to build</span>
            </div>
            
            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full w-[80%]"></div>
            </div>
          </div>

        </aside>
      </main>

      {/* Sticky Bottom Bar (Approval Checklist) */}
      <div className="bg-white border-t border-slate-200 px-8 py-4 sticky bottom-0 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">APPROVAL CHECKLIST</span>
              <div className="flex items-center space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-[#0F766E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#0F766E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#0F766E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#0F766E]"></div>
                <span className="text-sm font-semibold text-[#0F766E] ml-2">4 of 5 items confirmed</span>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4 text-sm font-medium">
              <div className="flex items-center space-x-1.5 text-slate-700">
                <CheckCircle2 size={16} className="text-green-500" />
                <span>RECORDS</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-700">
                <CheckCircle2 size={16} className="text-green-500" />
                <span>WORKFLOW</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-700">
                <CheckCircle2 size={16} className="text-green-500" />
                <span>ROLES</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-700">
                <CheckCircle2 size={16} className="text-green-500" />
                <span>ALERTS</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-400 border border-slate-200 px-3 py-1 rounded-lg">
                <div className="w-3.5 h-3.5 rounded border border-slate-300"></div>
                <span>CONFIRM ALL SUGGESTIONS</span>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleApprove}
            className="h-12 px-8 rounded-xl bg-[#0F766E] hover:bg-[#0D6B63] text-white font-bold flex items-center space-x-2 shadow-lg shadow-teal-900/10 transition-transform active:scale-[0.98]"
          >
            <span>Approve & Set Up Alerts</span>
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>

    </div>
  );
};

export default BlueprintReviewPage;
