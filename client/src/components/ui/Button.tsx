import React from 'react';
import { cn } from '../../utils/classNames';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#0F766E] hover:bg-[#14B8A6] active:scale-95 text-white',
  secondary: 'bg-[#4F46E5] hover:bg-[#6366F1] active:scale-95 text-white',
  outline: 'border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
  destructive: 'bg-[#DC2626] hover:bg-[#EF4444] text-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-10 px-3 text-sm',
  md: 'h-11 px-4 text-base',
  lg: 'h-12 px-6 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  children,
  ...rest
}) => {
  const baseClasses =
    'rounded-lg transition-all duration-200 flex items-center justify-center min-w-[44px] min-h-[44px]';

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    isLoading || disabled ? 'pointer-events-none opacity-70' : '',
    className
  );

  return (
    <button className={classes} disabled={disabled || isLoading} {...rest}>
      {isLoading ? <Spinner className="h-5 w-5" /> : children}
    </button>
  );
};
