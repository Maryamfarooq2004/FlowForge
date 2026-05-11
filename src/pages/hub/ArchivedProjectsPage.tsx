import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Archive, Info, MoreVertical, RefreshCcw, Trash2, X, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useArchivedProjects, 
  useRestoreProject, 
  useDeleteProject 
} from '../../hooks/useProjects';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { cn } from '../../utils/classNames';
import type { Project } from '../../types/project.types';

interface DeleteModalProps {
  project: Project | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ project, onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');
  if (!project) return null;
  const isConfirmed = confirmText === project.name;

  return (
    <Modal isOpen={!!project} onClose={onClose} className="max-w-md">
      <div className="p-8">
        <div className="bg-red-100 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-5">
          <Trash2 size={28} className="text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-poppins text-center mb-3">
          Permanently delete this project?
        </h2>
        <p className="text-sm text-slate-500 text-center mb-5 leading-relaxed">
          This will permanently delete <span className="font-semibold text-slate-700">{project.name}</span> and all
          associated data. This cannot be undone.
        </p>
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
            Type the project name to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder={project.name}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all"
          />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 h-11">Cancel</Button>
          <Button
            disabled={!isConfirmed}
            onClick={() => onConfirm(project.id)}
            className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed border-0"
          >
            Delete Permanently
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const ArchivedProjectsPage: React.FC = () => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  
  // Use custom hooks for real data and mutations
  const { data, isLoading } = useArchivedProjects();
  const { mutate: restoreProject } = useRestoreProject();
  const { mutate: deleteProject } = useDeleteProject();

  const archivedProjects = data?.projects || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F766E]" />
      </div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[28px] font-bold text-slate-900 font-poppins">Archived Projects</h1>
              <span className="bg-slate-100 text-slate-500 rounded-full px-3 py-1 text-sm font-medium">
                {archivedProjects.length} archived
              </span>
            </div>
            <p className="text-slate-500 text-sm">These projects are hidden from your main hub. Restore them anytime.</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
          <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700 leading-relaxed">
            Archived projects and their live deployments remain active. Archiving only hides them from your main view.
          </p>
        </div>

        {/* Project Grid */}
        {archivedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Archive size={56} className="text-slate-200 mb-4" />
            <h2 className="text-xl font-semibold text-slate-500 mb-2">No archived projects</h2>
            <p className="text-slate-400 text-sm mb-6">Projects you archive will appear here.</p>
            <Link to="/hub">
              <Button variant="outline" className="border-[#0F766E] text-[#0F766E] hover:bg-teal-50">
                <ArrowLeft size={16} className="mr-2" />
                Back to My Projects
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {archivedProjects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden opacity-90 hover:opacity-100 hover:shadow-md transition-all relative group"
              >
                {/* ARCHIVED badge */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-slate-700/80 text-white text-[10px] uppercase tracking-widest rounded-full px-3 py-1 font-bold">
                    ARCHIVED
                  </span>
                </div>

                {/* Card top */}
                <div className="h-24 relative bg-slate-50">
                  <div className="absolute bottom-4 left-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md bg-[#0F766E]">
                      <Archive size={22} className="text-white" />
                    </div>
                  </div>
                  {/* Kebab menu */}
                  <div className="absolute top-4 right-4">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === project.id ? null : project.id)}
                        className="p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-700 transition-colors shadow-sm"
                      >
                        <MoreVertical size={16} />
                      </button>
                      <AnimatePresence>
                        {openMenuId === project.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute right-0 top-9 bg-white rounded-xl shadow-xl border border-slate-100 z-20 w-48 py-1"
                          >
                            <button
                              onClick={() => { restoreProject(project.id); setOpenMenuId(null); }}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#0F766E] hover:bg-teal-50 w-full text-left"
                            >
                              <RefreshCcw size={15} className="text-[#0F766E]" />
                              Restore Project
                            </button>
                            <div className="h-[1px] bg-slate-100 my-1" />
                            <button
                              onClick={() => { setDeleteTarget(project); setOpenMenuId(null); }}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left"
                            >
                              <Trash2 size={15} className="text-red-500" />
                              Delete Permanently
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5 pt-4">
                  <h3 className="font-bold text-slate-800 text-base font-poppins mb-1 truncate">{project.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn(
                      'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                      project.domain === 'clinic' ? 'bg-teal-50 text-[#0F766E]' : 'bg-indigo-50 text-indigo-700'
                    )}>
                      {project.domain}
                    </span>
                    <span className="text-xs text-slate-400 capitalize">{project.status?.toLowerCase().replace('_', ' ')}</span>
                  </div>
                  <p className="text-xs text-slate-400">Last updated {new Date(project.updatedAt).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Delete Modal */}
      <DeleteModal project={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={(id) => { deleteProject(id); setDeleteTarget(null); }} />
    </>
  );
};

export default ArchivedProjectsPage;
