import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { cn } from '../../utils/classNames';

import { Footer } from './Footer';

import { Outlet, useLocation } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';

interface AppShellProps {
  sidebarType?: 'hub' | 'project';
  className?: string;
  children?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ 
  sidebarType = 'hub',
  className,
  children
}) => {
  const { sidebarCollapsed } = useUIStore();
  const { pathname } = useLocation();

  // Hide global navbar for pages that have their own specialized nav
  const hideGlobalNavbar = pathname.includes('/alerts') || pathname.includes('/workflows');

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col overflow-hidden">
      {!hideGlobalNavbar && <Navbar />}
      
      <div className={cn("flex flex-1 overflow-hidden", !hideGlobalNavbar ? "pt-0" : "pt-0")}>
        <Sidebar type={sidebarType} />
        
        <div className="flex-1 overflow-y-auto">
          <main className={cn("p-8", className)}>
            <div className="max-w-7xl mx-auto">
              {children || <Outlet />}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};
