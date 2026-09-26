import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Cpu, Mail, Info, BarChart3 } from 'lucide-react';
import { cn } from '../../utils/classNames';
import { useAdminUsage } from '../../hooks/useAdmin';

const prettyAction = (a: string) =>
  a.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const AdminApiUsagePage: React.FC = () => {
  const { data: usage, isLoading } = useAdminUsage();

  const daily = usage?.daily ?? [];
  const maxDaily = Math.max(1, ...daily.map((d) => d.count));
  const actions = usage?.actionCounts ?? [];
  const maxAction = Math.max(1, ...actions.map((a) => a.count));

  return (
    <AdminLayout currentSection="API Usage & Costs">
      <div className="space-y-8">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 font-poppins">Platform Activity</h1>
          <p className="text-slate-500 mt-1">Real usage from audit logs, generations, and notifications.</p>
        </div>

        {/* Honest AI-tracking note */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <Info size={18} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>Gemini request/token/cost metrics are not tracked in this build.</strong> Gemini is used for AI
            Suggestions and blueprint extraction, but the code generator itself is a deterministic pipeline —
            it makes no LLM calls. The metrics below are real platform activity.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white"><Cpu size={22} /></div>
              <div>
                <h3 className="font-bold text-slate-900">Code Generation</h3>
                <p className="text-xs text-slate-500">Deterministic pipeline runs</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><p className="text-xl font-bold text-green-700">{usage?.generations.completed ?? 0}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Completed</p></div>
              <div><p className="text-xl font-bold text-red-700">{usage?.generations.failed ?? 0}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Failed</p></div>
              <div><p className="text-xl font-bold text-slate-700">{usage ? (usage.generations.avgDurationMs / 1000).toFixed(1) : '0'}s</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Avg build</p></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white"><Mail size={22} /></div>
              <div>
                <h3 className="font-bold text-slate-900">Email Notifications</h3>
                <p className="text-xs text-slate-500">Delivery outcomes</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div><p className="text-xl font-bold text-green-700">{usage?.emails.sent ?? 0}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sent</p></div>
              <div><p className="text-xl font-bold text-red-700">{usage?.emails.failed ?? 0}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Failed</p></div>
            </div>
          </div>
        </div>

        {/* Daily activity chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-6"><BarChart3 size={18} className="text-[#0F766E]" /> Daily Activity (last 14 days)</h3>
          {isLoading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : daily.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No recorded activity in this window.</p>
          ) : (
            <div className="flex items-end justify-between gap-1 h-48">
              {daily.map((d) => (
                <div key={d.date} className="flex flex-col items-center gap-2 w-full group">
                  <div className="relative w-full max-w-[28px] h-40 bg-slate-50 rounded-t-lg flex items-end mx-auto overflow-hidden">
                    <div className="w-full bg-teal-400 group-hover:bg-[#0F766E] transition-colors" style={{ height: `${(d.count / maxDaily) * 100}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Audited actions (last 30 days)</h3>
          {actions.length === 0 ? (
            <p className="text-sm text-slate-400">No audited actions yet.</p>
          ) : (
            <div className="space-y-3">
              {actions.map((a) => (
                <div key={a.action} className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-slate-600 w-44 shrink-0 truncate">{prettyAction(a.action)}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full bg-[#0F766E]')} style={{ width: `${(a.count / maxAction) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-10 text-right">{a.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminApiUsagePage;
