import React from 'react';
import { cn } from '../../utils/classNames';

type InputVariant = 'default' | 'error' | 'success';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  variant?: InputVariant;
  errorMessage?: string;
  successMessage?: string;
};

export const Input: React.FC<InputProps> = ({
  label,
  variant = 'default',
  errorMessage,
  successMessage,
  className,
  id,
  ...rest
}) => {
  const inputId = id || `input-${label.replace(/\s+/g, '-').toLowerCase()}`;

  const baseClasses =
    'border border-[#E2E8F0] rounded-lg h-11 px-3 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors duration-200 w-full';

  const variantClasses = {
    default: '',
    error: 'border-[#DC2626] ring-2 ring-red-100',
    success: 'border-[#16A34A] ring-2 ring-green-100',
  }[variant];

  return (
    <div className={cn('flex flex-col space-y-1', className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={inputId}
        className={cn(baseClasses, variantClasses)}
        {...rest}
      />
      {variant === 'error' && errorMessage && (
        <p className="text-xs text-[#DC2626]" role="alert">
          {errorMessage}
        </p>
      )}
      {variant === 'success' && successMessage && (
        <p className="text-xs text-[#16A34A]" role="status">
          {successMessage}
        </p>
      )}
    </div>
  );
};
