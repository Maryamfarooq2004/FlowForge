import React from 'react';
import { cn } from '../../utils/classNames';

export type BadgeVariant =
  | 'intake'
  | 'spec-ready'
  | 'preview'
  | 'live'
  | 'clinic'
  | 'school'
  | 'default';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  intake: 'bg-amber-100 text-amber-700 border border-amber-200',
  'spec-ready': 'bg-blue-100 text-blue-700 border border-blue-200',
  preview: 'bg-violet-100 text-violet-700 border border-violet-200',
  live: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  clinic: 'bg-teal-100 text-teal-700',
  school: 'bg-purple-100 text-purple-700',
  default: 'bg-gray-100 text-gray-700',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  className,
  children,
  ...rest
}) => {
  const baseClasses =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border';

  return (
    <span
      className={cn(baseClasses, variantClasses[variant], className)}
      {...rest}
    >
      {children}
    </span>
  );
};
