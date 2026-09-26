import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Users, FolderOpen, Server, Cpu, Activity, GitBranch } from 'lucide-react';
import { cn } from '../../utils/classNames';
import { useAdminStats, useAdminActivity } from '../../hooks/useAdmin';
import { timeAgo } from '../../utils/timeAgo';

const prettyAction = (a: string) =>
  a.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading } = useAdminStats();
  const { data: activity = [] } = useAdminActivity(20);

  const kpis = stats
    ? [
        { label: 'Registered Users', value: stats.users.total, sub: `+${stats.users.newThisWeek} this week`, icon: Users, iconColor: 'text-blue-600', iconBg: 'bg-blue-50' },
        { label: 'Projects', value: stats.projects.total, sub: `${stats.projects.archived} archived`, icon: FolderOpen, iconColor: 'text-teal-600', iconBg: 'bg-teal-50' },
        { label: 'Live Deployments', value: stats.deployments.live, sub: `${stats.deployments.exported} exported`, icon: Server, iconColor: 'text-green-600', iconBg: 'bg-green-50' },
        { label: 'Generations', value: stats.generations.total, sub: `${stats.generations.completed} ok · ${stats.generations.failed} failed`, icon: Cpu, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50' },
      ]
    : [];

  const pipeline = stats
    ? [
        { label: 'Intake', v: stats.projects.byStatus.INTAKE ?? 0, color: 'bg-slate-400' },
        { label: 'Spec Ready', v: stats.projects.byStatus.SPEC_READY ?? 0, color: 'bg-indigo-400' },
        { label: 'Preview', v: stats.projects.byStatus.PREVIEW ?? 0, color: 'bg-teal-400' },
        { label: 'Live', v: stats.projects.byStatus.LIVE ?? 0, color: 'bg-green-500' },
      ]
    : [];
  const maxP = Math.max(1, ...pipeline.map((p) => p.v));

  return (
    <AdminLayout currentSection="Dashboard">
      <div className="space-y-8">
        <div>
          <h1 className="text-[32px] font-bold text-slate-900 font-poppins">Platform Overview</h1>
          <p className="text-slate-500 mt-1">FlowForge Admin — live metrics from real platform data.</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(isLoading ? Array.from({ length: 4 }) : kpis).map((kpi: any, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              {kpi ? (
                <>
                  <div className={cn('p-2.5 rounded-xl w-fit mb-4', kpi.iconBg)}>
                    <kpi.icon size={22} className={kpi.iconColor} />
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                  <p className="text-2xl font-bold text-slate-900 font-poppins">{kpi.value}</p>
                  <p className="text-xs font-semibold mt-1 text-slate-500">{kpi.sub}</p>
                </>
              ) : (
                <div className="h-24 animate-pulse bg-slate-50 rounded-lg" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project pipeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
              <GitBranch size={18} className="text-[#0F766E]" /> Project Pipeline
            </h3>
            <div className="flex items-end justify-between h-40 pt-4">
              {pipeline.map((bar, i) => (
                <div key={i} className="flex flex-col items-center gap-3 w-full">
                  <div className="relative w-12 h-28 bg-slate-50 rounded-lg overflow-hidden flex items-end">
                    <div className={cn('w-full', bar.color)} style={{ height: `${(bar.v / maxP) * 100}%` }} />
                    <span className="absolute inset-x-0 top-1 text-center text-[11px] font-bold text-slate-600">{bar.v}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Generation health */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Cpu size={18} className="text-indigo-500" /> Generation Health
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-green-700">{stats?.generations.completed ?? 0}</p>
                <p className="text-[10px] font-bold text-green-600/70 uppercase tracking-widest mt-1">Completed</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-red-700">{stats?.generations.failed ?? 0}</p>
                <p className="text-[10px] font-bold text-red-600/70 uppercase tracking-widest mt-1">Failed</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-blue-700">{stats?.generations.running ?? 0}</p>
                <p className="text-[10px] font-bold text-blue-600/70 uppercase tracking-widest mt-1">In progress</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-slate-700">
                  {stats ? (stats.generations.avgDurationMs / 1000).toFixed(1) : '0'}s
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Avg build time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Activity size={18} className="text-[#0F766E]" /> Recent Activity
          </h3>
          {activity.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No recorded activity yet.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {activity.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-bold text-[#0F766E] bg-teal-50 px-2 py-1 rounded-md tracking-wider shrink-0">
                      {prettyAction(a.action)}
                    </span>
                    <span className="text-sm text-slate-600 truncate">{a.email ?? 'system'}</span>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{timeAgo(a.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
