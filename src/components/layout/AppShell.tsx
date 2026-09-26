import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { cn } from '../../utils/classNames';

import { Footer } from './Footer';

import { Outlet, useLocation } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { VerifyEmailBanner } from '../shared/VerifyEmailBanner';

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

      {/* Offset the content row below the fixed 56px (h-14) navbar so it doesn't
          sit underneath it. Pages with their own nav (alerts/workflows) don't. */}
      <div className={cn("flex flex-1 overflow-hidden", !hideGlobalNavbar ? "pt-14" : "pt-0")}>
        <Sidebar type={sidebarType} />
        
        <div className="flex-1 overflow-y-auto">
          <VerifyEmailBanner />
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
