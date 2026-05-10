import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Server, 
  CreditCard,
  ShieldAlert,
  LogOut,
  Settings
} from 'lucide-react';
import { cn } from '../../utils/classNames';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Server, label: 'Deployments', path: '/admin/deployments' },
  { icon: CreditCard, label: 'API Usage', path: '/admin/api-usage' },
];

export const AdminSidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-[#1E293B] flex flex-col shrink-0">
      <div className="flex-1 py-6 px-4 space-y-1">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-3">
          Administration
        </p>
        
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              isActive 
                ? "bg-slate-700 text-white shadow-lg shadow-black/10" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            )}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
        <NavLink
          to="/hub/settings"
          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <Settings size={18} />
          <span>Admin Settings</span>
        </NavLink>
        <button 
          onClick={() => navigate('/hub')}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/10 transition-colors mt-1"
        >
          <ShieldAlert size={18} />
          <span>Exit Admin Mode</span>
        </button>
      </div>
    </aside>
  );
};
