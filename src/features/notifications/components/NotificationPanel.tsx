import React, { useState } from 'react';
import { X, Bell, Settings, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../utils/classNames';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'generation' | 'deployment' | 'error' | 'system' | 'email';
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'generation',
    title: 'My Organization — Generation complete',
    body: 'Your application is ready to preview. Code generation completed in 6m 42s.',
    timestamp: '2 hours ago',
    isRead: false,
  },
  {
    id: '2',
    type: 'deployment',
    title: 'LMS Dashboard — Preview deployed',
    body: 'Your preview environment is live at lms.preview.flowforge.app.',
    timestamp: '5 hours ago',
    isRead: false,
  },
  {
    id: '3',
    type: 'error',
    title: 'Patient Portal — LLM extraction timeout',
    body: 'The extraction failed due to a temporary API timeout. Please retry.',
    timestamp: '1 day ago',
    isRead: true,
  },
  {
    id: '4',
    type: 'email',
    title: 'Email verification resent to user@...',
    body: 'A new verification link was sent to user@company.com.',
    timestamp: '2 days ago',
    isRead: true,
  },
  {
    id: '5',
    type: 'system',
    title: 'FlowForge platform update v2.4',
    body: 'New features: Blueprint Review Studio improvements and faster generation.',
    timestamp: '3 days ago',
    isRead: true,
  },
];

const typeConfig = {
  generation: { bg: 'bg-teal-100', emoji: '⚙️' },
  deployment: { bg: 'bg-blue-100', emoji: '🚀' },
  error: { bg: 'bg-red-100', emoji: '⚠️' },
  system: { bg: 'bg-slate-100', emoji: '🔔' },
  email: { bg: 'bg-purple-100', emoji: '📧' },
};

type FilterTab = 'All' | 'Unread' | 'System';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRead }) => {
  const config = typeConfig[notification.type];
  return (
    <div
      onClick={() => onRead(notification.id)}
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
        <p className="text-xs text-slate-400 mt-2">{notification.timestamp}</p>
      </div>
      {!notification.isRead && (
        <div className="w-2 h-2 bg-[#0F766E] rounded-full mt-1.5 shrink-0" />
      )}
    </div>
  );
};

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<FilterTab>('All');

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const filtered = notifications.filter(n => {
    if (activeTab === 'Unread') return !n.isRead;
    if (activeTab === 'System') return n.type === 'system';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          />

          {/* Panel */}
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
                onClick={markAllRead}
                className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1"
              >
                <CheckCheck size={12} />
                Mark all as read
              </button>
            </div>

            {/* Filter tabs */}
            <div className="flex border-b border-slate-100 shrink-0">
              {(['All', 'Unread', 'System'] as FilterTab[]).map(tab => (
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

            {/* Notifications list */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
                  <Bell size={48} className="text-slate-200 mb-4" />
                  <p className="text-slate-500 font-semibold text-sm">All caught up!</p>
                  <p className="text-slate-400 text-xs mt-1">No new notifications.</p>
                </div>
              ) : (
                filtered.map(n => (
                  <NotificationItem key={n.id} notification={n} onRead={markRead} />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-100 shrink-0">
              <Link
                to="/hub/settings"
                onClick={onClose}
                className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Settings size={13} />
                Notification preferences
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
