import { useState, useRef, useEffect } from 'react';
import { Clock, MoreVertical, ExternalLink, Copy, Archive, Trash2 } from 'lucide-react';
import type { Project, ProjectStatus, ProjectDomain } from '../../../types/project.types';

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  INTAKE:     { label: 'Intake',     className: 'bg-amber-100 text-amber-700 border-amber-200' },
  SPEC_READY: { label: 'Spec Ready', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  PREVIEW:    { label: 'Preview',    className: 'bg-violet-100 text-violet-700 border-violet-200' },
  LIVE:       { label: 'Live',       className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

const domainConfig: Record<ProjectDomain, { label: string; className: string }> = {
  clinic: { label: 'Clinic', className: 'bg-teal-100 text-teal-700' },
  school: { label: 'School', className: 'bg-purple-100 text-purple-700' },
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
};

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export const ProjectCard = ({
  project,
  onOpen,
  onDuplicate,
  onArchive,
  onDelete,
}: ProjectCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const status = statusConfig[project.status] ?? statusConfig.INTAKE;
  const domain = domainConfig[project.domain] ?? domainConfig.clinic;

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm 
                    hover:shadow-md transition-all duration-200 p-5 flex flex-col">
      {/* Top Row */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border 
                         ${domain.className}`}>
          {domain.label}
        </span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border 
                         ${status.className}`}>
          {status.label}
        </span>
      </div>

      {/* Project Name */}
      <h3 className="font-semibold text-slate-800 text-base mt-3 font-poppins 
                     line-clamp-2 leading-snug">
        {project.name}
      </h3>

      {/* Business Name */}
      {project.businessName && (
        <p className="text-sm text-slate-500 mt-1 truncate">{project.businessName}</p>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Row */}
      <div className="flex items-center justify-between mt-4 pt-4 
                      border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDate(project.updatedAt)}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Open button */}
          <button
            onClick={onOpen}
            className="text-sm font-medium text-[#0F766E] hover:text-[#0D6B63] 
                       flex items-center gap-1 transition-colors"
          >
            Open
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* Kebab menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 
                         hover:text-slate-600 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 bottom-8 w-44 bg-white rounded-xl 
                              border border-slate-200 shadow-lg z-20 py-1 
                              overflow-hidden">
                <button
                  onClick={() => { onOpen(); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 
                             hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  Open Project
                </button>
                <button
                  onClick={() => { onDuplicate(); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 
                             hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <Copy className="w-4 h-4 text-slate-400" />
                  Duplicate
                </button>
                <button
                  onClick={() => { onArchive(); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 
                             hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <Archive className="w-4 h-4 text-slate-400" />
                  Archive
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => { setShowDeleteConfirm(true); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 
                             hover:bg-red-50 flex items-center gap-2.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation inline */}
      {showDeleteConfirm && (
        <div className="mt-3 pt-3 border-t border-red-100 bg-red-50 
                        rounded-xl p-3 -mx-1">
          <p className="text-xs text-red-700 font-medium mb-2">
            Delete this project? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => { onDelete(); setShowDeleteConfirm(false); }}
              className="flex-1 bg-red-600 text-white text-xs font-medium 
                         py-1.5 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 bg-white text-slate-600 text-xs font-medium 
                         py-1.5 rounded-lg border border-slate-200 
                         hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
