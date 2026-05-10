import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Archive, Info, MoreVertical, RefreshCcw, ExternalLink, Trash2, X, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { cn } from '../../utils/classNames';

interface ArchivedProject {
  id: string;
  name: string;
  domain: 'clinic' | 'school';
  status: string;
  lastUpdated: string;
  color: string;
}

const ARCHIVED_PROJECTS: ArchivedProject[] = [
  { id: '1', name: 'Patient Portal Redesign', domain: 'clinic', status: 'Generation Complete', lastUpdated: '3 days ago', color: '#0F766E' },
  { id: '2', name: 'LMS Dashboard v1', domain: 'school', status: 'Blueprint Ready', lastUpdated: '1 week ago', color: '#4F46E5' },
  { id: '3', name: 'Old Clinic Intake', domain: 'clinic', status: 'Intake Draft', lastUpdated: '2 weeks ago', color: '#0F766E' },
];

interface DeleteModalProps {
  project: ArchivedProject | null;
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
          associated data including IntakeBundles, WorkflowSpec, and generated code. This cannot be undone.
        </p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5">
          <p className="text-sm text-red-700 font-medium">⚠ This action is irreversible.</p>
        </div>
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
  const [projects, setProjects] = useState<ArchivedProject[]>(ARCHIVED_PROJECTS);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ArchivedProject | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleRestore = (project: ArchivedProject) => {
    setProjects(prev => prev.filter(p => p.id !== project.id));
    setOpenMenuId(null);
    showToast(`${project.name} restored to My Projects`);
  };

  const handleDelete = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setDeleteTarget(null);
    showToast('Project permanently deleted.');
  };

  return (
    <AppShell>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[28px] font-bold text-slate-900 font-poppins">Archived Projects</h1>
              <span className="bg-slate-100 text-slate-500 rounded-full px-3 py-1 text-sm font-medium">
                {projects.length} archived
              </span>
            </div>
            <p className="text-slate-500">These projects are hidden from your main hub. Restore them anytime.</p>
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
        {projects.length === 0 ? (
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
            {projects.map((project, i) => (
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
                <div className="h-24 relative" style={{ backgroundColor: `${project.color}15` }}>
                  <div className="absolute bottom-4 left-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: project.color }}>
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
                              onClick={() => handleRestore(project)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#0F766E] hover:bg-teal-50 w-full text-left"
                            >
                              <RefreshCcw size={15} className="text-[#0F766E]" />
                              Restore Project
                            </button>
                            <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 w-full text-left">
                              <ExternalLink size={15} className="text-slate-400" />
                              Open Project
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
                  <h3 className="font-bold text-slate-800 text-base font-poppins mb-1">{project.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn(
                      'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                      project.domain === 'clinic' ? 'bg-teal-50 text-[#0F766E]' : 'bg-indigo-50 text-indigo-700'
                    )}>
                      {project.domain}
                    </span>
                    <span className="text-xs text-slate-400">{project.status}</span>
                  </div>
                  <p className="text-xs text-slate-400">Last updated {project.lastUpdated}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Delete Modal */}
      <DeleteModal project={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium"
          >
            <CheckCircle2 size={18} className="text-green-400 shrink-0" />
            {toast}
            <button onClick={() => setToast(null)} className="ml-2 text-white/50 hover:text-white">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
};

export default ArchivedProjectsPage;
