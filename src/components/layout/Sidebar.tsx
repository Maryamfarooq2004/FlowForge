import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { 
  FolderRoot, 
  Archive, 
  Settings, 
  LifeBuoy,
  LayoutDashboard,
  FileCode,
  GitBranch,
  Cloud,
  BellRing
} from 'lucide-react';
import { cn } from '../../utils/classNames';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  type?: 'hub' | 'project';
}

export const Sidebar: React.FC<SidebarProps> = ({ type = 'hub' }) => {
  const { projectId } = useParams();
  const { user } = useAuthStore();

  const hubItems = [
    { icon: FolderRoot, label: 'My Projects', path: '/hub' },
    { icon: Archive, label: 'Archived Projects', path: '/hub/archived' },
    { icon: Settings, label: 'Settings', path: '/hub/settings' },
    { icon: LifeBuoy, label: 'Support', path: '/hub/support' },
  ];

  const projectItems = [
    { icon: LayoutDashboard, label: 'Generation Status', path: `/project/${projectId}/generating` },
    { icon: FileCode, label: 'Logs', path: `/project/${projectId}/logs` },
    { icon: GitBranch, label: 'Artifacts', path: `/project/${projectId}/artifacts` },
    { icon: BellRing, label: 'Workflows', path: `/project/${projectId}/workflows` },
    { icon: Cloud, label: 'Infrastructure', path: `/project/${projectId}/infrastructure` },
  ];

  const items = type === 'project' ? projectItems : hubItems;
  const title = type === 'project' ? 'Generation Detail' : 'Project Hub';
  const subtitle = type === 'project' ? 'Build Insights' : 'Management Center';

  return (
    <aside className="w-52 bg-white border-r border-[#E2E8F0] flex flex-col h-[calc(100vh-3.5rem)] sticky top-14">
      <div className="p-5">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{title}</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{subtitle}</p>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-2">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
              isActive 
                ? "bg-teal-50 text-[#0F766E] border-l-2 border-[#0F766E] rounded-l-none" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon size={18} className={cn(
              "transition-colors",
              "group-hover:text-[#0F766E]"
            )} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Card Bottom */}
      <div className="p-4 border-t border-[#E2E8F0] bg-slate-50/50">
        <div className="flex items-center space-x-3">
          <Avatar name={user?.fullName || "User"} size="sm" />
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-800 truncate">{user?.fullName}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

