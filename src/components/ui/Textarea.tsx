import React from 'react';
import { cn } from '../../utils/classNames';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  errorMessage?: string;
};

export const Textarea: React.FC<TextareaProps> = ({ label, errorMessage, className, id, rows = 3, ...rest }) => {
  const textareaId = id || `textarea-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const base =
    'border border-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors duration-200 w-full resize-y';

  return (
    <div className={cn('flex flex-col space-y-1', className)}>
      <label htmlFor={textareaId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        id={textareaId}
        rows={rows}
        className={cn(base, errorMessage && 'border-[#DC2626] ring-2 ring-red-100')}
        {...rest}
      />
      {errorMessage && (
        <p className="text-xs text-[#DC2626]" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
