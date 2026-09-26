import React from 'react';
import { cn } from '../../utils/classNames';

/** Composable, unstyled-ish table primitives for generated/dynamic lists. */

export const Table: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div className="overflow-x-auto">
    <table className={cn('w-full text-left border-collapse', className)}>{children}</table>
  </div>
);

export const THead: React.FC<React.PropsWithChildren> = ({ children }) => (
  <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
    {children}
  </thead>
);

export const TBody: React.FC<React.PropsWithChildren> = ({ children }) => (
  <tbody className="divide-y divide-slate-50">{children}</tbody>
);

export const TR: React.FC<React.PropsWithChildren<{ onClick?: () => void; className?: string }>> = ({
  children,
  onClick,
  className,
}) => (
  <tr
    onClick={onClick}
    className={cn(onClick && 'hover:bg-slate-50 cursor-pointer transition-colors', className)}
  >
    {children}
  </tr>
);

export const TH: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <th className={cn('py-3 px-3 font-bold whitespace-nowrap', className)}>{children}</th>
);

export const TD: React.FC<React.PropsWithChildren<{ className?: string; colSpan?: number }>> = ({
  children,
  className,
  colSpan,
}) => (
  <td colSpan={colSpan} className={cn('py-2.5 px-3 text-sm text-slate-700 align-middle', className)}>
    {children}
  </td>
);
