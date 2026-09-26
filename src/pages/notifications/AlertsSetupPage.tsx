import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Logo } from '../../components/shared/Logo';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/classNames';
import { Bell, HelpCircle, Info, PlusCircle, ArrowRight, ArrowLeft } from 'lucide-react';

import { useAuthStore } from '../../store/authStore';
import { useProject } from '../../hooks/useProjects';
import { useAlertConfig, useSaveAlertConfig } from '../../hooks/useNotifications';
import type { AlertChannel, AlertTrigger } from '../../types/notification.types';

const emailOn = (c: AlertChannel) => c === 'email' || c === 'both';
const inAppOn = (c: AlertChannel) => c === 'in-app' || c === 'both';
// Always keep at least one channel — neither selected falls back to in-app.
const channelFrom = (email: boolean, inApp: boolean): AlertChannel =>
  email && inApp ? 'both' : email ? 'email' : 'in-app';

const AlertsSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useAuthStore();
  const { data: project } = useProject(projectId);
  const { data: config, isLoading } = useAlertConfig(projectId);
  const save = useSaveAlertConfig(projectId);

  const [triggers, setTriggers] = useState<AlertTrigger[]>([]);

  // Seed local editable state from the fetched (spec-derived) config.
  useEffect(() => {
    if (config) setTriggers(config);
  }, [config]);

  const update = (i: number, patch: Partial<AlertTrigger>) =>
    setTriggers((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));

  const toggleEmail = (i: number, t: AlertTrigger) =>
    update(i, { channel: channelFrom(!emailOn(t.channel), inAppOn(t.channel)) });
  const toggleInApp = (i: number, t: AlertTrigger) =>
    update(i, { channel: channelFrom(emailOn(t.channel), !inAppOn(t.channel)) });

  const addCustom = () =>
    setTriggers((prev) => [...prev, { event: '', channel: 'both', enabled: true }]);

  const handleSave = () => {
    if (!projectId) return;
    const cleaned = triggers.filter((t) => t.event.trim().length > 0);
    save.mutate(cleaned, {
      onSuccess: () => {
        toast.success('Alert settings saved.');
        navigate(`/project/${projectId}/generating`);
      },
    });
  };

  const handleBack = () => navigate(`/project/${projectId || 'new'}/spec`);

  const activeCount = triggers.filter((t) => t.enabled).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <nav className="w-full h-14 bg-[#134E4A] flex items-center justify-between px-6 shrink-0 sticky top-0 z-50">
        <div className="flex items-center space-x-6">
          <Logo size="sm" variant="light" useSecondary={true} />
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span className="text-white/50">Project: {project?.name || 'My Organization'}</span>
            <span className="text-white/30">&gt;</span>
            <span className="text-white">Set Up Alerts</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/hub/notifications')} className="text-white/70 hover:text-white">
            <Bell size={20} />
          </button>
          <button onClick={() => navigate('/hub/support')} className="text-white/70 hover:text-white">
            <HelpCircle size={20} />
          </button>
          <div className="flex items-center gap-3">
            <Avatar name={user?.fullName || 'User'} size="sm" className="bg-[#34D399] text-[#134E4A]" />
            <span className="text-sm font-semibold text-white hidden lg:block">{user?.fullName}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-8 lg:p-12 pb-32">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-slate-900 font-poppins leading-tight mb-2">
            Set Up Alerts for Your App
          </h1>
          <p className="text-slate-500 font-inter">
            Choose which events in your app should send alerts, and how. These are built directly into your generated
            application.
          </p>
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info size={20} className="text-[#0F766E] shrink-0 mt-0.5" />
          <p className="text-sm text-teal-900 font-medium">
            We found {triggers.length} alert event{triggers.length === 1 ? '' : 's'} in your workflow
            {activeCount !== triggers.length ? ` (${activeCount} on)` : ''}. Toggle the ones you want — your app will
            handle the rest automatically.
          </p>
        </div>

        {/* Alerts Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-6">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0F766E] text-white">
              <tr>
                <th className="px-6 py-4 font-semibold text-sm w-3/5">What Happens in Your App</th>
                <th className="px-6 py-4 font-semibold text-sm w-1/5 text-center">Send Via</th>
                <th className="px-6 py-4 font-semibold text-sm w-1/5 text-center">Turn On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm">
                    Loading alerts…
                  </td>
                </tr>
              ) : triggers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No alert events yet. Add a custom alert below.
                  </td>
                </tr>
              ) : (
                triggers.map((t, index) => (
                  <tr
                    key={index}
                    className={cn(
                      'transition-colors hover:bg-teal-50/30',
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50',
                      !t.enabled && 'opacity-60 grayscale'
                    )}
                  >
                    <td className="px-6 py-5">
                      <input
                        value={t.event}
                        onChange={(e) => update(index, { event: e.target.value })}
                        placeholder="Describe the event (e.g. Follow-up due)"
                        className="w-full bg-transparent font-semibold text-slate-800 text-sm leading-snug border-b border-transparent focus:border-slate-300 focus:outline-none"
                      />
                      {t.description && <p className="text-xs text-slate-500 mt-1">{t.description}</p>}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        {/* Email */}
                        <div className="flex flex-col items-center space-y-1">
                          <button
                            onClick={() => toggleEmail(index, t)}
                            disabled={!t.enabled}
                            className={cn(
                              'w-8 h-4 rounded-full relative transition-colors duration-200',
                              emailOn(t.channel) ? 'bg-[#0F766E]' : 'bg-slate-200'
                            )}
                          >
                            <div
                              className={cn(
                                'w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all duration-200',
                                emailOn(t.channel) ? 'left-4' : 'left-0.5'
                              )}
                            />
                          </button>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">EMAIL</span>
                        </div>
                        {/* In-App */}
                        <div className="flex flex-col items-center space-y-1">
                          <button
                            onClick={() => toggleInApp(index, t)}
                            disabled={!t.enabled}
                            className={cn(
                              'w-8 h-4 rounded-full relative transition-colors duration-200',
                              inAppOn(t.channel) ? 'bg-[#0F766E]' : 'bg-slate-200'
                            )}
                          >
                            <div
                              className={cn(
                                'w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all duration-200',
                                inAppOn(t.channel) ? 'left-4' : 'left-0.5'
                              )}
                            />
                          </button>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">IN-APP</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => update(index, { enabled: !t.enabled })}
                        className={cn(
                          'w-10 h-6 rounded-full relative transition-colors duration-200 mx-auto',
                          t.enabled ? 'bg-[#0F766E]' : 'bg-slate-300'
                        )}
                      >
                        <div
                          className={cn(
                            'w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200 shadow-sm',
                            t.enabled ? 'left-5' : 'left-1'
                          )}
                        />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <button
          onClick={addCustom}
          className="text-[#0F766E] font-semibold text-sm flex items-center space-x-2 hover:underline mb-10"
        >
          <PlusCircle size={16} />
          <span>Add a custom alert</span>
        </button>

        {/* Email delivery note (honest: server-configured, not per-project) */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-700">Email delivery.</span> In-app alerts work out of the box. Email
          alerts are sent once your deployment has an email provider configured (SendGrid) — you'll add that key when you
          deploy. Until then, alerts marked “email” are delivered in-app.
        </div>
      </main>

      {/* Footer */}
      <div className="w-full bg-white border-t border-slate-200 px-8 py-4 sticky bottom-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <Button
            onClick={handleSave}
            disabled={save.isPending}
            className="h-12 px-6 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#4F46E5] text-white font-bold flex items-center space-x-2 shadow-lg shadow-teal-900/10 transition-transform active:scale-[0.98]"
          >
            <span>{save.isPending ? 'Saving…' : 'Save Alert Settings & Continue'}</span>
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertsSetupPage;
