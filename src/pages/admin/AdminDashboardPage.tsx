import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { 
  Users, 
  FolderOpen, 
  Server, 
  CreditCard, 
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { cn } from '../../utils/classNames';
import { motion } from 'framer-motion';

const AdminDashboardPage: React.FC = () => {
  const [lastRefreshed, setLastRefreshed] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefreshed(prev => prev + 1);
    }, 1000);
    
    // Auto refresh every 30s
    const refreshInterval = setInterval(() => {
      handleRefresh();
    }, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(refreshInterval);
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed(0);
    }, 1000);
  };

  return (
    <AdminLayout currentSection="Dashboard">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-slate-900 font-poppins">Platform Overview</h1>
            <p className="text-slate-500 mt-1">FlowForge Admin Panel — Live metrics</p>
          </div>
          <div className="flex items-center space-x-3 text-xs text-slate-400 font-medium pb-1">
            <span>Last refreshed: {lastRefreshed}s ago</span>
            <button 
              onClick={handleRefresh}
              className={cn("p-1.5 rounded-lg hover:bg-slate-100 transition-colors", isRefreshing && "animate-spin text-[#0F766E]")}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Registered Users', value: '142', sub: '+8 this week', subColor: 'text-green-600', icon: Users, iconColor: 'text-blue-600', iconBg: 'bg-blue-50' },
            { label: 'Active Projects', value: '89', sub: '34 in progress', subColor: 'text-slate-500', icon: FolderOpen, iconColor: 'text-teal-600', iconBg: 'bg-teal-50' },
            { label: 'Live Deployments', value: '23', sub: 'All healthy ✓', subColor: 'text-green-600', icon: Server, iconColor: 'text-green-600', iconBg: 'bg-green-50' },
            { label: 'LLM API Cost (This Month)', value: '$48.32', sub: 'Budget: $100/month', subColor: 'text-amber-600', icon: CreditCard, iconColor: 'text-amber-500', iconBg: 'bg-amber-50', hasProgress: true },
          ].map((kpi, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl transition-colors", kpi.iconBg)}>
                  <kpi.icon size={22} className={kpi.iconColor} />
                </div>
                <TrendingUp size={16} className="text-slate-300 group-hover:text-slate-400" />
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-slate-900 font-poppins">{kpi.value}</p>
              <p className={cn("text-xs font-semibold mt-1", kpi.subColor)}>{kpi.sub}</p>
              
              {kpi.hasProgress && (
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '48.32%' }} />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* System Health Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel 1: API Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Activity size={18} className="text-[#0F766E]" />
                API Status
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LIVE STATUS</span>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Google Gemini API', status: 'Operational', color: 'bg-green-500' },
                { name: 'SendGrid', status: 'Operational', color: 'bg-green-500' },
                { name: 'Vercel Deploy API', status: 'Operational', color: 'bg-green-500' },
                { name: 'Railway API', status: 'Degraded Performance', color: 'bg-amber-500', isWarning: true },
              ].map((api, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", api.color)} />
                    <span className="text-sm font-medium text-slate-700">{api.name}</span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                    api.isWarning ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"
                  )}>
                    {api.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 2: Generation Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <RefreshCw size={18} className="text-blue-500" />
                Generation Queue
              </h3>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">3 IN PROGRESS</span>
            </div>
            <div className="space-y-5">
              {[
                { id: 'proj_034', progress: 67, name: 'Heritage School' },
                { id: 'proj_028', progress: 34, name: 'City Hospital' },
                { id: 'proj_041', progress: 12, name: 'Dental Plus' },
              ].map((gen, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700 font-mono">{gen.id}</span>
                    <span className="text-slate-400">{gen.name}</span>
                    <span className="font-bold text-[#0F766E]">{gen.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${gen.progress}%` }}
                      className="h-full bg-blue-500 rounded-full" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 3: Recent Errors */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-500" />
                Recent Errors
              </h3>
              <a href="https://sentry.io/flowforge" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest flex items-center gap-1">
                VIEW SENTRY <ExternalLink size={10} />
              </a>
            </div>
            <div className="space-y-4">
              {[
                { msg: 'LLM timeout', proj: 'proj_033', time: '2 hours ago' },
                { msg: 'Deploy failed', proj: 'proj_027', time: '5 hours ago' },
                { msg: 'Schema mismatch', proj: 'proj_019', time: '12 hours ago' },
              ].map((err, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-700">{err.msg}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{err.proj}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{err.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 4: User Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Users size={18} className="text-indigo-500" />
                User Activity (last 24h)
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">REAL-TIME</span>
            </div>
            <div className="flex items-end justify-between h-40 pt-4">
              {[
                { label: 'Signups', value: 3, max: 50, color: 'bg-indigo-400' },
                { label: 'Logins', value: 47, max: 50, color: 'bg-[#0F766E]' },
                { label: 'Projects', value: 8, max: 50, color: 'bg-teal-400' },
                { label: 'Generations', value: 12, max: 50, color: 'bg-blue-400' },
              ].map((bar, i) => (
                <div key={i} className="flex flex-col items-center gap-3 w-full">
                  <div className="relative w-12 h-32 bg-slate-50 rounded-lg overflow-hidden flex items-end">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(bar.value / bar.max) * 100}%` }}
                      className={cn("w-full transition-all duration-1000", bar.color)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-[10px] font-bold text-slate-600 mix-blend-overlay">{bar.value}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
