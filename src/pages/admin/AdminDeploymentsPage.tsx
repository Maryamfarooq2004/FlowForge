import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Server, ExternalLink, Search, Package, Clock } from 'lucide-react';
import { cn } from '../../utils/classNames';
import { useAdminDeployments } from '../../hooks/useAdmin';
import { timeAgo } from '../../utils/timeAgo';

const statusStyle = (s: string) =>
  s === 'live'
    ? { bg: 'bg-green-50 text-green-600', chip: 'bg-green-100 text-green-700' }
    : s === 'exported'
    ? { bg: 'bg-blue-50 text-blue-600', chip: 'bg-blue-100 text-blue-700' }
    : { bg: 'bg-slate-100 text-slate-500', chip: 'bg-slate-100 text-slate-600' };

const AdminDeploymentsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const { data: deployments = [], isLoading } = useAdminDeployments();

  const filtered = deployments.filter(
    (d) =>
      d.projectName.toLowerCase().includes(search.toLowerCase()) ||
      (d.ownerEmail ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout currentSection="Deployments">
      <div className="space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-slate-900 font-poppins">Deployments</h1>
            <p className="text-slate-500 mt-1">Every project's export/deploy status (config emitted; user-hosted).</p>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search project or owner…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search deployments"
              className="pl-10 pr-4 h-10 w-64 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
            No deployments yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((dep) => {
              const st = statusStyle(dep.status);
              return (
                <div key={dep.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', st.bg)}>
                        <Server size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 truncate">{dep.projectName}</h3>
                        <p className="text-[11px] text-slate-400 truncate">{dep.ownerEmail ?? '—'}</p>
                      </div>
                    </div>
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase shrink-0', st.chip)}>
                      {dep.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Live URL</span>
                      {dep.liveUrl ? (
                        <a href={dep.liveUrl} target="_blank" rel="noreferrer" className="text-[#0F766E] font-semibold flex items-center gap-1 hover:underline truncate max-w-[160px]">
                          {dep.liveUrl.replace(/^https?:\/\//, '')} <ExternalLink size={12} className="shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400">not set</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Exports</span>
                      <span className="text-slate-700 font-medium flex items-center gap-1.5">
                        <Package size={12} className="text-slate-300" /> {dep.exportCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Last export</span>
                      <span className="text-slate-700 font-medium flex items-center gap-1.5">
                        <Clock size={12} className="text-slate-300" /> {dep.lastExportAt ? timeAgo(dep.lastExportAt) : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDeploymentsPage;
