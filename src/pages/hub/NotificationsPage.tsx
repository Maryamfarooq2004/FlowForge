import React, { useState } from 'react';
import { Bell, Search, CheckCheck, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { cn } from '../../utils/classNames';

interface Notification {
  id: string;
  type: 'generation' | 'deployment' | 'error' | 'system' | 'email';
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'generation', title: 'My Organization — Generation complete', body: 'Your application is ready to preview. Code generation completed in 6m 42s.', timestamp: '2 hours ago', isRead: false },
  { id: '2', type: 'deployment', title: 'LMS Dashboard — Preview deployed', body: 'Your preview environment is live at lms.preview.flowforge.app.', timestamp: '5 hours ago', isRead: false },
  { id: '3', type: 'error', title: 'Patient Portal — LLM extraction timeout', body: 'The extraction failed due to a temporary API timeout. Please retry from the Blueprint Review page.', timestamp: '1 day ago', isRead: true },
  { id: '4', type: 'email', title: 'Email verification resent to user@...', body: 'A new verification link was sent to user@company.com. Valid for 24 hours.', timestamp: '2 days ago', isRead: true },
  { id: '5', type: 'system', title: 'FlowForge platform update v2.4', body: 'New features: Blueprint Review Studio improvements and faster generation pipeline.', timestamp: '3 days ago', isRead: true },
];

const typeConfig = {
  generation: { bg: 'bg-teal-100', emoji: '⚙️', label: 'Generation' },
  deployment: { bg: 'bg-blue-100', emoji: '🚀', label: 'Deployment' },
  error: { bg: 'bg-red-100', emoji: '⚠️', label: 'Error' },
  system: { bg: 'bg-slate-100', emoji: '🔔', label: 'System' },
  email: { bg: 'bg-purple-100', emoji: '📧', label: 'Email' },
};

type FilterTab = 'All' | 'Unread' | 'System';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

  const filtered = notifications.filter(n => {
    const matchesTab = activeTab === 'All' ? true : activeTab === 'Unread' ? !n.isRead : n.type === 'system';
    const matchesSearch = searchQuery === '' || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AppShell>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-poppins flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-[#0F766E] text-white text-sm font-bold rounded-full px-3 py-0.5">
                  {unreadCount} unread
                </span>
              )}
            </h1>
            <p className="text-slate-500 mt-1">Stay up to date on your projects and platform activity.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 text-sm font-semibold text-[#0F766E] hover:underline"
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
            <Link to="/hub/settings" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-2 transition-colors hover:bg-slate-50">
              <Settings size={16} />
              Preferences
            </Link>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 h-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
              />
            </div>
            <div className="flex bg-slate-100 rounded-xl p-1">
              {(['All', 'Unread', 'System'] as FilterTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors',
                    activeTab === tab ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Notification list */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Bell size={56} className="text-slate-200 mb-5" />
              <p className="font-semibold text-slate-500 text-lg">All caught up!</p>
              <p className="text-slate-400 text-sm mt-1">No notifications match your filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((n, i) => {
                const config = typeConfig[n.type];
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => markRead(n.id)}
                    className={cn(
                      'flex items-start gap-4 p-5 cursor-pointer border-l-4 transition-colors group',
                      n.isRead
                        ? 'border-transparent hover:bg-slate-50'
                        : 'bg-teal-50/40 border-[#0F766E] hover:bg-teal-50'
                    )}
                  >
                    <div className={cn('w-11 h-11 rounded-full flex items-center justify-center text-lg shrink-0', config.bg)}>
                      {config.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('text-sm font-semibold leading-snug', n.isRead ? 'text-slate-700' : 'text-slate-900')}>
                          {n.title}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-slate-400 whitespace-nowrap">{n.timestamp}</span>
                          {!n.isRead && <div className="w-2 h-2 bg-[#0F766E] rounded-full" />}
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">{n.body}</p>
                      <span className={cn(
                        'inline-block text-[10px] font-bold uppercase tracking-wider mt-2 px-2 py-0.5 rounded-full',
                        config.bg, 'text-slate-600'
                      )}>
                        {config.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </AppShell>
  );
};

export default NotificationsPage;
