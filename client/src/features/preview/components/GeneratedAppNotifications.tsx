import React, { useState } from 'react';
import { CheckCheck } from 'lucide-react';
import { cn } from '../../../utils/classNames';

interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
  action?: { label: string; color?: string };
  group: string;
}

const NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    title: 'Follow-up overdue: Omar Riaz',
    body: "Omar Riaz's follow-up was due 2 days ago. Please call or book an appointment.",
    time: 'Today, 9:00 AM',
    isRead: false,
    action: { label: 'Book Appointment', color: 'bg-[#0F766E] text-white' },
    group: 'TODAY',
  },
  {
    id: '2',
    title: 'Fee payment outstanding: Fatima Malik',
    body: 'PKR 2,500 outstanding for 8 days.',
    time: 'Today, 8:30 AM',
    isRead: false,
    action: { label: 'View Payment', color: 'border border-slate-200 text-slate-700' },
    group: 'TODAY',
  },
  {
    id: '3',
    title: 'New appointment booked',
    body: 'Ahmed Khan booked a General Checkup for 9 May at 09:30 AM',
    time: 'Yesterday, 4:15 PM',
    isRead: true,
    group: 'YESTERDAY',
  },
  {
    id: '4',
    title: 'Prescription approved by Dr. Ahmad',
    body: 'Prescription for Zainab Ali has been approved',
    time: 'Yesterday, 2:00 PM',
    isRead: true,
    group: 'YESTERDAY',
  },
];

export const GeneratedAppNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const unread = notifications.filter(n => !n.isRead).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

  const groups = [...new Set(NOTIFICATIONS.map(n => n.group))];

  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-slate-900 font-poppins">Notifications</h1>
          {unread > 0 && (
            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full">{unread} unread</span>
          )}
        </div>
        <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] hover:underline">
          <CheckCheck size={14} />
          Mark all as read
        </button>
      </div>

      {/* Grouped notifications */}
      <div className="space-y-5">
        {groups.map(group => {
          const groupNotifs = notifications.filter(n => n.group === group);
          return (
            <div key={group}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{group}</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-50">
                {groupNotifs.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={cn(
                      'flex items-start gap-4 p-4 cursor-pointer border-l-2 transition-colors',
                      n.isRead
                        ? 'bg-white border-transparent hover:bg-slate-50'
                        : 'bg-teal-50/50 border-[#0F766E] hover:bg-teal-50'
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5',
                      n.isRead ? 'bg-slate-100' : 'bg-teal-100'
                    )}>
                      {n.isRead ? '✓' : '🔔'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('text-xs font-bold leading-snug', n.isRead ? 'text-slate-600' : 'text-slate-900')}>
                          {n.title}
                        </p>
                        {!n.isRead && <div className="w-2 h-2 bg-[#0F766E] rounded-full shrink-0 mt-1" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.body}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                        {n.action && (
                          <button
                            className={cn('text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors', n.action.color)}
                            onClick={e => { e.stopPropagation(); markRead(n.id); }}
                          >
                            {n.action.label}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GeneratedAppNotifications;
