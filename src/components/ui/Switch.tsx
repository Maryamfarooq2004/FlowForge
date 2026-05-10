import React from 'react';
import { cn } from '../../utils/classNames';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({ label, className, ...props }) => {
  return (
    <label className={cn("flex items-center cursor-pointer group", className)}>
      <div className="relative">
        <input type="checkbox" className="sr-only peer" {...props} />
        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-[#0F766E]/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0F766E]"></div>
      </div>
      {label && <span className="ml-3 text-sm font-medium text-slate-700">{label}</span>}
    </label>
  );
};
