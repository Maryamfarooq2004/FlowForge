import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../../components/shared/Logo';
import { Button } from '../../components/ui/Button';
import { 
  Cloud, 
  ExternalLink, 
  Copy, 
  Rocket, 
  Globe, 
  Download, 
  GitBranch, 
  CheckCircle2,
  Code2
} from 'lucide-react';

const DeploymentHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const handleDeployLive = () => {
    // Navigate to dashboard or show toast
    navigate('/hub');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-inter">
      {/* Header */}
      <nav className="h-14 bg-[#134E4A] flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center space-x-6">
          <Logo size="sm" variant="light" useSecondary={true} />
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span className="text-white/50">My Organization</span>
            <span className="text-white/30">&gt;</span>
            <span className="text-white">Deploy & Export</span>
          </div>
        </div>

        <div>
          <Button 
            onClick={handleDeployLive}
            className="bg-[#0F766E] hover:bg-[#0D6B63] text-white text-xs font-bold px-6 py-2 h-auto rounded-lg"
          >
            Deploy Live
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-5xl mx-auto">
          
          <div className="mb-10">
            <h1 className="text-[32px] font-bold text-slate-900 font-poppins mb-2">Your App is Ready to Go Live</h1>
            <p className="text-slate-500 text-sm">My Organization — Last generated: Today 11:42 AM</p>
          </div>

          {/* Top Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            
            {/* Left Column: Deployment Status */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col h-full">
              <div className="flex items-center space-x-3 mb-8">
                <Cloud size={24} className="text-[#0F766E]" />
                <h2 className="font-semibold text-slate-800 text-lg">Deployment Status</h2>
              </div>
              
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">LIVE</div>
                <span className="text-sm font-medium text-slate-600">Production environment active</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between mb-8 group">
                <span className="font-mono text-sm text-slate-700 select-all">alshifa.preview.flowforge.app</span>
                <div className="flex items-center space-x-3">
                  <button className="text-slate-400 hover:text-[#0F766E] transition-colors"><Copy size={16} /></button>
                  <button className="text-[#0F766E] font-semibold text-sm flex items-center space-x-1 hover:underline">
                    <span>Open</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-auto flex flex-col md:flex-row items-center gap-6">
                <Button 
                  className="w-full md:w-auto h-14 px-8 rounded-xl bg-[#0F766E] hover:bg-[#0D6B63] text-white font-bold flex items-center justify-center space-x-3 shadow-lg shadow-teal-900/10 transition-transform active:scale-[0.98]"
                >
                  <Rocket size={20} />
                  <span>Deploy Live</span>
                </Button>
                <p className="text-xs text-slate-400 leading-relaxed text-center md:text-left">
                  This will update the production build. Changes may take up to 2 minutes to propagate.
                </p>
              </div>
            </div>

            {/* Right Column: Custom Domain */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col h-full">
              <div className="flex items-center space-x-3 mb-8">
                <Globe size={24} className="text-slate-800" />
                <h2 className="font-semibold text-slate-800 text-lg">Custom Domain</h2>
              </div>

              <div className="mb-6">
                <input 
                  type="text" 
                  value="clinic.alshifa.com"
                  readOnly
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none mb-3"
                />
                <Button className="w-full h-12 bg-[#0F766E] hover:bg-[#0D6B63] text-white font-bold rounded-xl transition-colors">
                  Connect Domain
                </Button>
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">DNS SETTINGS</span>
                  <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider animate-pulse">PROPAGATING...</span>
                </div>
                
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2 text-slate-500">Type</td>
                      <td className="py-2 font-bold text-slate-800">CNAME</td>
                      <td className="py-2"></td>
                    </tr>
                    <tr>
                      <td className="py-2 text-slate-500">Host</td>
                      <td className="py-2 font-bold text-slate-800">app</td>
                      <td className="py-2 text-right"><button className="text-slate-400 hover:text-slate-600"><Copy size={12} /></button></td>
                    </tr>
                    <tr>
                      <td className="py-2 text-slate-500">Value</td>
                      <td className="py-2 font-bold text-slate-800 font-mono">cname.vercel-dns.com</td>
                      <td className="py-2 text-right"><button className="text-slate-400 hover:text-slate-600"><Copy size={12} /></button></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <button className="w-full h-10 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors mt-auto">
                Verify DNS
              </button>
            </div>
          </div>

          {/* Source Code Export Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center space-x-3 mb-8">
              <Code2 size={24} className="text-slate-800" />
              <h2 className="font-semibold text-slate-800 text-lg">Export Your Source Code</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Download ZIP */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row gap-5 items-start hover:border-[#0F766E] transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-[#0F766E] rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                  <Download size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1">Download ZIP</h3>
                  <p className="text-sm text-slate-500 mb-3">Export full source code bundle for manual deployment.</p>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">React + Tailwind • 12.4MB</span>
                </div>
              </div>

              {/* Push to GitHub */}
              <div className="bg-[#4F46E5]/5 rounded-xl border border-indigo-200 p-6 flex flex-col md:flex-row gap-5 items-start hover:border-indigo-400 transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-[#4F46E5] rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                  <GitBranch size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1">Push to GitHub</h3>
                  <p className="text-sm text-slate-500 mb-3">Sync directly with your repository and set up CI/CD.</p>
                  <span className="text-[#0F766E] text-sm font-semibold flex items-center space-x-1">
                    <CheckCircle2 size={16} />
                    <span>Connected: alshifa-org/web-app</span>
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 px-8 py-6 shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-[#0F766E] text-lg font-poppins">FlowForge</span>
            <span className="text-xs text-slate-400">© 2026 All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-6 text-sm text-slate-500">
            <button className="hover:text-slate-800 transition-colors">Privacy Policy</button>
            <button className="hover:text-slate-800 transition-colors">Terms of Service</button>
            <button className="hover:text-slate-800 transition-colors">Help Center</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DeploymentHubPage;
