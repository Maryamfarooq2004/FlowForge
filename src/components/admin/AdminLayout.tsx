import React from 'react';
import { Navbar } from '../layout/Navbar';
import { AdminSidebar } from './AdminSidebar';
import { cn } from '../../utils/classNames';
import { Footer } from '../layout/Footer';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentSection?: string;
  className?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  currentSection,
  className
}) => {
  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col overflow-hidden">
      <Navbar currentSection={currentSection} isAdmin={true} />
      
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        
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
