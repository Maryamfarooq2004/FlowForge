import React from 'react';
import { cn } from '../../utils/classNames';
import type { SelectOption } from '../../types/global.types';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  errorMessage?: string;
};

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  placeholder,
  errorMessage,
  className,
  id,
  ...rest
}) => {
  const selectId = id || `select-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const base =
    'border border-[#E2E8F0] rounded-lg h-11 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors duration-200 w-full disabled:bg-slate-50 disabled:text-slate-400';

  return (
    <div className={cn('flex flex-col space-y-1', className)}>
      <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={selectId}
        className={cn(base, errorMessage && 'border-[#DC2626] ring-2 ring-red-100')}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {errorMessage && (
        <p className="text-xs text-[#DC2626]" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
