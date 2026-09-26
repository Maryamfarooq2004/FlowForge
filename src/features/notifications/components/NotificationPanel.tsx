import React, { useState } from 'react';
import { X, Bell, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../../utils/classNames';
import { timeAgo } from '../../../utils/timeAgo';
import { useNotifications, useMarkAllRead, useMarkRead } from '../../../hooks/useNotifications';
import type { AppNotification, NotificationType } from '../../../types/notification.types';

const typeConfig: Record<NotificationType, { bg: string; emoji: string }> = {
  SPEC_READY: { bg: 'bg-indigo-100', emoji: '📋' },
  SPEC_APPROVED: { bg: 'bg-teal-100', emoji: '✅' },
  GENERATION_STARTED: { bg: 'bg-slate-100', emoji: '⚙️' },
  GENERATION_COMPLETED: { bg: 'bg-teal-100', emoji: '🎉' },
  GENERATION_FAILED: { bg: 'bg-red-100', emoji: '⚠️' },
  EXPORT_READY: { bg: 'bg-blue-100', emoji: '📦' },
  DEPLOY_LIVE: { bg: 'bg-emerald-100', emoji: '🚀' },
};

type FilterTab = 'All' | 'Unread';

interface NotificationItemProps {
  notification: AppNotification;
  onOpen: (n: AppNotification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onOpen }) => {
  const config = typeConfig[notification.type] ?? { bg: 'bg-slate-100', emoji: '🔔' };
  return (
    <div
      onClick={() => onOpen(notification)}
      className={cn(
        'flex items-start gap-3 p-4 cursor-pointer border-l-2 transition-colors group',
        notification.isRead
          ? 'bg-white border-transparent hover:bg-slate-50'
          : 'bg-teal-50 border-[#0F766E] hover:bg-teal-100/50'
      )}
    >
      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-base', config.bg)}>
        {config.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 leading-snug">{notification.title}</p>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notification.body}</p>
        <p className="text-xs text-slate-400 mt-2">{timeAgo(notification.createdAt)}</p>
      </div>
      {!notification.isRead && <div className="w-2 h-2 bg-[#0F766E] rounded-full mt-1.5 shrink-0" />}
    </div>
  );
};

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const { data, isLoading } = useNotifications(isOpen);
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? notifications.filter((n) => !n.isRead).length;
  const filtered = activeTab === 'Unread' ? notifications.filter((n) => !n.isRead) : notifications;

  const openNotification = (n: AppNotification) => {
    if (!n.isRead) markRead.mutate(n.id);
    if (n.link) {
      navigate(n.link);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          />

          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed right-0 top-0 h-full w-80 bg-white border-l border-[#E2E8F0] shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 font-poppins">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="bg-[#0F766E] text-white text-[10px] font-bold rounded-full px-2 py-0.5 leading-none">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/hub/notifications"
                    onClick={onClose}
                    className="text-xs font-semibold text-[#0F766E] hover:underline"
                  >
                    See all
                  </Link>
                  <button
                    onClick={onClose}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <button
                onClick={() => markAllRead.mutate()}
                disabled={unreadCount === 0 || markAllRead.isPending}
                className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1 disabled:opacity-40 disabled:no-underline"
              >
                <CheckCheck size={12} />
                Mark all as read
              </button>
            </div>

            {/* Filter tabs */}
            <div className="flex border-b border-slate-100 shrink-0">
              {(['All', 'Unread'] as FilterTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'flex-1 text-sm font-semibold py-3 transition-colors border-b-2',
                    activeTab === tab
                      ? 'text-[#0F766E] border-[#0F766E]'
                      : 'text-slate-500 border-transparent hover:text-slate-700'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {isLoading ? (
                <div className="flex items-center justify-center h-40 text-sm text-slate-400">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
                  <Bell size={48} className="text-slate-200 mb-4" />
                  <p className="text-slate-500 font-semibold text-sm">All caught up!</p>
                  <p className="text-slate-400 text-xs mt-1">No new notifications.</p>
                </div>
              ) : (
                filtered.map((n) => <NotificationItem key={n.id} notification={n} onOpen={openNotification} />)
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
