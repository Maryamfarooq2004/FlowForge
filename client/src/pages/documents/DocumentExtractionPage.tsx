import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../../components/shared/Logo';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/classNames';
import { 
  Bell, 
  HelpCircle,
  CloudUpload,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

const DocumentExtractionPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const handleMerge = () => {
    navigate(`/project/${projectId || 'new'}/theme`);
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
            <span className="text-white">Documents Extraction</span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <button className="text-sm font-bold text-white border-b-2 border-white pb-1 mt-1">Documents</button>
          <button className="text-sm font-bold text-white/40 hover:text-white/70 transition-colors pb-1 mt-1 border-b-2 border-transparent">Insights</button>
          <button className="text-sm font-bold text-white/40 hover:text-white/70 transition-colors pb-1 mt-1 border-b-2 border-transparent">Settings</button>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-white/70 hover:text-white">
            <Bell size={20} />
          </button>
          <button className="text-white/70 hover:text-white">
            <HelpCircle size={20} />
          </button>
          <Avatar name="Maryam Farooq" size="sm" className="bg-[#34D399] text-[#134E4A]" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12">
        <div className="max-w-[1400px] mx-auto space-y-8">
          
          <div>
            <h1 className="text-[28px] font-bold text-slate-900 font-poppins leading-tight mb-2">Upload Existing Documents (Optional)</h1>
            <p className="text-slate-500 font-inter">
              Upload any Excel registers, process PDFs, or flowchart images you already use — we will extract the structure automatically.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Panel: Upload */}
            <div className="w-full lg:w-[40%] space-y-6">
              <h2 className="font-semibold text-slate-800 text-lg">Upload Files</h2>
              
              {/* Dropzone */}
              <div className="border-2 border-dashed border-teal-400 rounded-2xl p-10 text-center bg-teal-50/30 cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-all group">
                <div className="w-16 h-16 mx-auto bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CloudUpload size={32} />
                </div>
                <p className="text-[#0F766E] font-medium mb-1">
                  Drag & drop Excel, PDF, or image files here <span className="underline decoration-teal-300">or Browse Files</span>
                </p>
                <p className="text-xs text-slate-400">Max 10 MB per file • xlsx, xls, pdf, png, jpg</p>
              </div>

              {/* File List */}
              <div className="space-y-3">
                {/* File 1 */}
                <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <FileSpreadsheet size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">patient_register.xlsx</p>
                      <p className="text-xs text-slate-400">340KB</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider">ANALYZED</div>
                    <button className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>

                {/* File 2 */}
                <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">clinic_process.pdf</p>
                      <p className="text-xs text-slate-400">1.2MB</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider animate-pulse flex items-center space-x-1">
                      <Sparkles size={10} />
                      <span>EXTRACTING...</span>
                    </div>
                    <button className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>

                {/* File 3 */}
                <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                      <ImageIcon size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">flow_diagram.png</p>
                      <p className="text-xs text-slate-400">890KB</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider">PENDING</div>
                    <button className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Extraction Review */}
            <div className="w-full lg:w-[60%] space-y-6">
              <h2 className="font-semibold text-slate-800 text-lg">Extraction Review</h2>
              
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                
                {/* Preview Table */}
                <div className="border-b border-slate-200">
                  <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PATIENT_REGISTER.XLSX (PREVIEW)</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                      <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-white text-slate-500 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-3 font-medium">Patient Name</th>
                          <th className="px-6 py-3 font-medium">Phone</th>
                          <th className="px-6 py-3 font-medium">Date</th>
                          <th className="px-6 py-3 font-medium">Diagnosis</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700 divide-y divide-slate-50">
                        <tr>
                          <td className="px-6 py-3">Sarah J. Miller</td>
                          <td className="px-6 py-3">+1 555-0123</td>
                          <td className="px-6 py-3">2023-11-24</td>
                          <td className="px-6 py-3">Hypertension</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="px-6 py-3">David Chen</td>
                          <td className="px-6 py-3">+1 555-0199</td>
                          <td className="px-6 py-3">2023-11-25</td>
                          <td className="px-6 py-3">Type II Diabetes</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Extraction Results */}
                <div className="p-6">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <tr>
                        <th className="pb-3 w-1/4">ENTITY</th>
                        <th className="pb-3 w-1/4">EXTRACTED VALUE</th>
                        <th className="pb-3 w-1/4">CONFIDENCE</th>
                        <th className="pb-3 w-1/4 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      <tr>
                        <td className="py-4 font-semibold text-slate-800">Patient Name</td>
                        <td className="py-4 text-slate-600">Sarah J. Miller</td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#0F766E] w-[94%]"></div>
                            </div>
                            <span className="text-xs font-bold text-[#0F766E]">94%</span>
                          </div>
                        </td>
                        <td className="py-4 text-right space-x-3">
                          <button className="text-[#0F766E] font-semibold hover:underline">Confirm</button>
                          <span className="text-slate-300">|</span>
                          <button className="text-slate-400 hover:text-slate-600">Discard</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-4 font-semibold text-slate-800">Phone Number</td>
                        <td className="py-4 text-slate-600">+1 555-0123</td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#0F766E] w-[91%]"></div>
                            </div>
                            <span className="text-xs font-bold text-[#0F766E]">91%</span>
                          </div>
                        </td>
                        <td className="py-4 text-right space-x-3">
                          <button className="text-[#0F766E] font-semibold hover:underline">Confirm</button>
                          <span className="text-slate-300">|</span>
                          <button className="text-slate-400 hover:text-slate-600">Discard</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-4 font-semibold text-slate-800">Appointment Date</td>
                        <td className="py-4 text-slate-600">2023-11-24</td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 w-[87%]"></div>
                            </div>
                            <span className="text-xs font-bold text-emerald-600">87%</span>
                          </div>
                        </td>
                        <td className="py-4 text-right space-x-3">
                          <button className="text-[#0F766E] font-semibold hover:underline">Confirm</button>
                          <span className="text-slate-300">|</span>
                          <button className="text-slate-400 hover:text-slate-600">Discard</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-4 font-semibold text-slate-800">Diagnosis</td>
                        <td className="py-4 text-slate-600">Hypertension</td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 w-[68%]"></div>
                            </div>
                            <span className="text-xs font-bold text-amber-600">68%</span>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <div className="inline-flex items-center space-x-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-200">
                            <AlertTriangle size={14} />
                            <span>Review</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Conflict Alert */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-start space-x-3">
                  <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800 text-sm">1 conflict detected</h4>
                    <p className="text-sm text-amber-700/80 mt-1 mb-4">Patient Name was already captured in your intake. Choose which to keep.</p>
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 bg-white border border-amber-200 text-amber-700 rounded-lg text-sm font-bold hover:bg-amber-50 transition-colors">
                        Keep Intake Version
                      </button>
                      <button className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold shadow-md shadow-amber-500/20 hover:bg-amber-600 transition-colors">
                        Use Document Version
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-8 flex justify-center">
            <Button 
              onClick={handleMerge}
              className="h-14 px-12 rounded-2xl bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white text-lg font-bold flex items-center space-x-3 shadow-xl shadow-teal-900/10 transition-transform active:scale-[0.98] w-full max-w-[800px] justify-center"
            >
              <span>Merge into IntakeBundle</span>
              <Sparkles size={20} />
            </Button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DocumentExtractionPage;
