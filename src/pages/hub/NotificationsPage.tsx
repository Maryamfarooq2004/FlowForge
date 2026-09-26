import React from 'react';
import { Bell, ArrowLeft, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useNotifications, useMarkAllRead, useMarkRead } from '../../hooks/useNotifications';
import type { AppNotification, NotificationType } from '../../types/notification.types';
import { timeAgo } from '../../utils/timeAgo';

const typeConfig: Record<NotificationType, { emoji: string; color: string; bg: string }> = {
  SPEC_READY: { emoji: '📋', color: 'text-indigo-500', bg: 'bg-indigo-50' },
  SPEC_APPROVED: { emoji: '✅', color: 'text-teal-600', bg: 'bg-teal-50' },
  GENERATION_STARTED: { emoji: '⚙️', color: 'text-slate-500', bg: 'bg-slate-50' },
  GENERATION_COMPLETED: { emoji: '🎉', color: 'text-teal-600', bg: 'bg-teal-50' },
  GENERATION_FAILED: { emoji: '⚠️', color: 'text-red-500', bg: 'bg-red-50' },
  EXPORT_READY: { emoji: '📦', color: 'text-blue-500', bg: 'bg-blue-50' },
  DEPLOY_LIVE: { emoji: '🚀', color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const open = (n: AppNotification) => {
    if (!n.isRead) markRead.mutate(n.id);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-slate-500" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 font-poppins">Notifications</h1>
        {unreadCount > 0 && (
          <span className="bg-[#0F766E] text-white text-xs font-bold rounded-full px-2.5 py-1 leading-none">
            {unreadCount} unread
          </span>
        )}
        <div className="ml-auto">
          <button
            onClick={() => markAllRead.mutate()}
            disabled={unreadCount === 0 || markAllRead.isPending}
            className="text-sm font-semibold text-[#0F766E] hover:underline flex items-center gap-1.5 disabled:opacity-40 disabled:no-underline"
          >
            <CheckCheck size={15} />
            Mark all as read
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-24 text-slate-400">Loading notifications…</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-24 bg-white border border-dashed border-slate-200 rounded-2xl">
            <Bell size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No notifications yet</p>
            <p className="text-slate-400 text-sm mt-1">
              We'll let you know when your blueprint, build, or deployment is ready.
            </p>
          </div>
        ) : (
          notifications.map((n) => {
            const cfg = typeConfig[n.type] ?? { emoji: '🔔', color: 'text-slate-500', bg: 'bg-slate-50' };
            return (
              <div
                key={n.id}
                onClick={() => open(n)}
                className={`${n.isRead ? 'bg-white' : cfg.bg} border ${
                  n.isRead ? 'border-slate-100' : 'border-teal-200'
                } rounded-2xl p-6 flex gap-4 cursor-pointer transition-transform hover:scale-[1.01]`}
              >
                <div className={`${cfg.color} shrink-0 text-2xl leading-none`}>{cfg.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-3">
                    <h3 className="font-bold text-slate-900">{n.title}</h3>
                    <span className="text-xs text-slate-400 font-medium shrink-0">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{n.body}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 bg-[#0F766E] rounded-full mt-2 shrink-0" />}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <Button variant="outline" onClick={() => navigate('/hub')}>
          Back to Hub
        </Button>
      </div>
    </div>
  );
};

export default NotificationsPage;
