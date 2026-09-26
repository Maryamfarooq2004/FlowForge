import React from 'react';
import { cn } from '../../../utils/classNames';
import { stateColor, stateLabel } from './format';
import type { PreviewWorkflowMeta } from '../../../types/preview.types';

export const StateBadge: React.FC<{ workflow?: PreviewWorkflowMeta; statusKey?: string }> = ({
  workflow,
  statusKey,
}) => (
  <span className={cn('inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold', stateColor(workflow, statusKey))}>
    {stateLabel(workflow, statusKey)}
  </span>
);
