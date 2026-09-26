import React from 'react';
import { cn } from '../../../utils/classNames';
import { LayoutDashboard, Database } from 'lucide-react';
import { usePreviewTheme } from './theme';
import type { PreviewSpecMeta, PreviewRecord } from '../../../types/preview.types';

interface Props {
  meta: PreviewSpecMeta;
  records: Record<string, PreviewRecord[]>;
  screen: string;
  entityKey?: string;
  onDashboard: () => void;
  onEntity: (key: string) => void;
}

export const PreviewSidebar: React.FC<Props> = ({ meta, records, screen, entityKey, onDashboard, onEntity }) => {
  const { brand, fonts } = usePreviewTheme();

  const item = (active: boolean) =>
    cn(
      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
      active ? 'border-l-2' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
    );
  // Active item tinted with the brand primary (inline — Tailwind can't take dynamic hex).
  const activeStyle = (active: boolean) =>
    active ? { color: brand.primary, borderColor: brand.primary, backgroundColor: `${brand.primary}14` } : undefined;

  return (
    <aside className="w-56 bg-white border-r border-slate-200 shrink-0 flex flex-col p-4 overflow-y-auto">
      <div className="px-2 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Generated App</p>
        <p className="font-bold text-slate-800 truncate" style={{ fontFamily: fonts.heading }}>{meta.appLabel}</p>
      </div>
      <nav className="space-y-1">
        <button className={item(screen === 'dashboard')} style={activeStyle(screen === 'dashboard')} onClick={onDashboard}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>
        {meta.entities.map((e) => {
          const active = entityKey === e.key && screen !== 'dashboard';
          return (
            <button key={e.key} className={item(active)} style={activeStyle(active)} onClick={() => onEntity(e.key)}>
              <Database size={18} />
              <span className="flex-1 text-left truncate">{e.label}</span>
              <span className="text-[10px] font-bold text-slate-400">{(records[e.key] ?? []).length}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
