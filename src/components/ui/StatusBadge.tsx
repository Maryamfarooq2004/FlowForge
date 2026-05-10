import React from 'react';
import { cn } from '../../utils/classNames';

export type ProjectStatus = 'INTAKE' | 'SPEC_READY' | 'PREVIEW' | 'LIVE';

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

const statusConfig: Record<ProjectStatus, { label: string; classes: string }> = {
  INTAKE: {
    label: 'INTAKE',
    classes: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  SPEC_READY: {
    label: 'SPEC READY',
    classes: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  PREVIEW: {
    label: 'PREVIEW',
    classes: 'bg-violet-100 text-violet-700 border-violet-200',
  },
  LIVE: {
    label: 'LIVE',
    classes: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider border',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
};
