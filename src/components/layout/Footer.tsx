import React from 'react';
import { cn } from '../../utils/classNames';

interface FooterProps {
  className?: string;
  fullWidth?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ className, fullWidth = true }) => {
  return (
    <footer className={cn(
      "h-12 border-t border-slate-200 bg-white flex items-center justify-between px-6 text-[11px] text-slate-400 shrink-0",
      !fullWidth && "max-w-7xl mx-auto border-t-0",
      className
    )}>
      <div className="flex items-center space-x-2">
        <span className="font-bold text-[#0F766E] tracking-tight">FlowForge</span>
        <span className="opacity-70">© 2026 All rights reserved.</span>
      </div>
      
      <div className="flex items-center space-x-6 font-medium">
        <a href="https://flowforge.io/privacy" target="_blank" rel="noreferrer" className="hover:text-[#0F766E] transition-colors">Privacy Policy</a>
        <a href="https://flowforge.io/terms" target="_blank" rel="noreferrer" className="hover:text-[#0F766E] transition-colors">Terms of Service</a>
        <button 
          onClick={() => window.location.href = '/hub/support'}
          className="hover:text-[#0F766E] transition-colors"
        >
          Help Center
        </button>
      </div>
    </footer>
  );
};
