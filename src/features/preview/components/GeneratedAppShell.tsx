import React from 'react';
import { cn } from '../../../utils/classNames';
import {
  LayoutDashboard, Calendar, Users, Stethoscope, CreditCard,
  Bell, Settings, HelpCircle, LogOut
} from 'lucide-react';

type AppScreen = 
  | 'dashboard-receptionist' | 'dashboard-doctor' | 'dashboard-manager'
  | 'patients' | 'patient-detail' | 'new-patient'
  | 'payments' | 'notifications';

type AppRole = 'Receptionist' | 'Doctor' | 'Manager';

interface GeneratedAppShellProps {
  children: React.ReactNode;
  activeScreen: AppScreen;
  activeRole: AppRole;
  onNavigate: (screen: AppScreen) => void;
}

const roleNavItems = (role: AppRole): { id: AppScreen; label: string; icon: typeof LayoutDashboard; badge?: string }[] => {
  const dashboardId: AppScreen = role === 'Doctor' ? 'dashboard-doctor' : role === 'Manager' ? 'dashboard-manager' : 'dashboard-receptionist';
  const items: { id: AppScreen; label: string; icon: typeof LayoutDashboard; badge?: string }[] = [
    { id: dashboardId, label: 'Dashboard', icon: LayoutDashboard },
  ];
  if (role !== 'Manager') items.push({ id: 'patients' as AppScreen, label: 'Appointments', icon: Calendar });
  items.push({ id: 'patients' as AppScreen, label: 'Patients', icon: Users });
  if (role === 'Manager') items.push({ id: 'dashboard-manager' as AppScreen, label: 'Doctors', icon: Stethoscope });
  if (role !== 'Doctor') items.push({ id: 'payments' as AppScreen, label: 'Payments', icon: CreditCard });
  items.push({ id: 'notifications' as AppScreen, label: 'Notifications', icon: Bell, badge: '4' });
  return items;
};

export const GeneratedAppShell: React.FC<GeneratedAppShellProps> = ({
  children, activeScreen, activeRole, onNavigate
}) => {
  const navItems = roleNavItems(activeRole);
  const isDashboard = activeScreen.startsWith('dashboard');

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Sidebar */}
      <aside className="w-52 bg-white border-r border-slate-200 shrink-0 flex flex-col">
        <div className="p-4 flex items-center space-x-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-full bg-[#0F766E] text-white flex items-center justify-center font-bold text-lg shrink-0">A</div>
          <div className="overflow-hidden">
            <h2 className="font-bold text-[#0F766E] text-sm leading-tight truncate">My Organization</h2>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Business Management</p>
          </div>
        </div>

        <nav className="px-3 py-4 space-y-0.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeScreen === item.id || 
              (item.id === 'dashboard-receptionist' && isDashboard && activeRole === 'Receptionist') ||
              (item.id === 'dashboard-doctor' && isDashboard && activeRole === 'Doctor') ||
              (item.id === 'dashboard-manager' && isDashboard && activeRole === 'Manager') ||
              (item.id === 'patients' && (activeScreen === 'patients' || activeScreen === 'patient-detail' || activeScreen === 'new-patient'));
            
            return (
              <button
                key={`${item.id}-${item.label}`}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors',
                  isActive
                    ? 'font-bold text-[#0F766E] bg-teal-50 border-l-4 border-[#0F766E] rounded-l-none'
                    : 'font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                )}
              >
                <item.icon size={16} className="shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 space-y-0.5">
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-slate-500 rounded-lg hover:bg-slate-50 transition-colors">
            <Settings size={16} />
            <span>Settings</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-slate-500 rounded-lg hover:bg-slate-50 transition-colors">
            <HelpCircle size={16} />
            <span>Support</span>
          </button>
          <div className="h-px bg-slate-100 my-1" />
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-red-400 rounded-lg hover:bg-red-50 transition-colors">
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
        {children}
      </main>
    </div>
  );
};

export type { AppScreen, AppRole };
export default GeneratedAppShell;
