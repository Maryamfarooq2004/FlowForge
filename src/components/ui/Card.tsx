import React from 'react';
import { cn } from '../../utils/classNames';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn('p-6 border-b border-[#E2E8F0]', className)} {...props}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn('p-6 bg-slate-50 border-t border-[#E2E8F0]', className)} {...props}>
      {children}
    </div>
  );
};
