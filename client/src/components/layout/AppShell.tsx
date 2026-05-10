import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { cn } from '../../utils/classNames';

import { Footer } from './Footer';

interface AppShellProps {
  children: React.ReactNode;
  projectName?: string;
  currentSection?: string;
  sidebarType?: 'hub' | 'project';
  className?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ 
  children, 
  projectName, 
  currentSection,
  sidebarType = 'hub',
  className
}) => {
  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col overflow-hidden">
      <Navbar projectName={projectName} currentSection={currentSection} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar type={sidebarType} />
        
        <div className="flex-1 overflow-y-auto">
          <main className={cn("p-8", className)}>
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};
