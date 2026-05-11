import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { 
  Server, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter,
  Play,
  RotateCw,
  Terminal
} from 'lucide-react';
import { cn } from '../../utils/classNames';

const MOCK_DEPLOYMENTS = [
  { id: 'dep_001', project: 'My Organization', url: 'alshifa.flowforge.app', status: 'LIVE', runtime: 'Node 22.x', region: 'us-east-1', lastDeploy: '2 hours ago' },
  { id: 'dep_002', project: 'Heritage School', url: 'heritage.flowforge.app', status: 'LIVE', runtime: 'Node 22.x', region: 'us-east-1', lastDeploy: '5 hours ago' },
  { id: 'dep_003', project: 'City Hospital', url: 'cityhosp.flowforge.app', status: 'BUILDING', runtime: 'Node 22.x', region: 'eu-west-1', lastDeploy: 'Just now' },
  { id: 'dep_004', project: 'Dental Plus', url: 'dentalplus.flowforge.app', status: 'LIVE', runtime: 'Node 22.x', region: 'us-east-1', lastDeploy: '1 day ago' },
  { id: 'dep_005', project: 'Blue Academy', url: 'blueacad.flowforge.app', status: 'FAILED', runtime: 'Node 22.x', region: 'us-east-1', lastDeploy: '3 days ago' },
];

const AdminDeploymentsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  return (
    <AdminLayout currentSection="Deployments">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-slate-900 font-poppins">Live Deployments</h1>
            <p className="text-slate-500 mt-1">Monitor and manage generated application instances.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search deployments..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 h-10 w-64 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
              />
            </div>
            <button className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Deployments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {MOCK_DEPLOYMENTS.map((dep) => (
            <div key={dep.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    dep.status === 'LIVE' ? "bg-green-50 text-green-600" :
                    dep.status === 'BUILDING' ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                  )}>
                    <Server size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{dep.project}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{dep.id}</p>
                  </div>
                </div>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest",
                  dep.status === 'LIVE' ? "bg-green-100 text-green-700" :
                  dep.status === 'BUILDING' ? "bg-blue-100 text-blue-700 animate-pulse" : "bg-red-100 text-red-700"
                )}>
                  {dep.status}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Public URL</span>
                  <a href={`https://${dep.url}`} target="_blank" rel="noreferrer" className="text-[#0F766E] font-semibold flex items-center gap-1 hover:underline">
                    {dep.url} <ExternalLink size={12} />
                  </a>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Runtime</span>
                  <span className="text-slate-700 font-medium">{dep.runtime} ({dep.region})</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Last Deployed</span>
                  <span className="text-slate-700 font-medium flex items-center gap-1.5">
                    <Clock size={12} className="text-slate-300" /> {dep.lastDeploy}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                <button className="flex-1 h-9 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                  <Terminal size={14} />Logs
                </button>
                <button className="flex-1 h-9 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                  <RotateCw size={14} />Redeploy
                </button>
                <button className="w-9 h-9 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center transition-colors">
                  <Play size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDeploymentsPage;
