import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Settings, Bell, Users, AlertTriangle, Stethoscope, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../../components/layout/AppShell';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { cn } from '../../utils/classNames';

type SubNavSection = 'general' | 'notifications' | 'team' | 'danger';

const SUB_NAV: { id: SubNavSection; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'team', label: 'Team & Access', icon: Users },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
];

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-b-0">
    <div>
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
    </div>
    <button
      onClick={onChange}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0',
        checked ? 'bg-[#0F766E]' : 'bg-slate-200'
      )}
    >
      <div className={cn(
        'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200',
        checked ? 'left-[22px]' : 'left-0.5'
      )} />
    </button>
  </div>
);

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, projectName }) => {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmed = confirmText === projectName;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-8">
        <div className="bg-red-100 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-5">
          <Trash2 size={28} className="text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-poppins text-center mb-3">
          Permanently delete this project?
        </h2>
        <p className="text-sm text-slate-500 text-center mb-5 leading-relaxed">
          This will permanently delete <span className="font-semibold text-slate-700">{projectName}</span> and all
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
            placeholder={projectName}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all"
          />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 h-11">Cancel</Button>
          <Button
            disabled={!isConfirmed}
            className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed border-0"
          >
            Delete Permanently
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const ProjectSettingsPage: React.FC = () => {
  const { projectId } = useParams();
  const [activeSection, setActiveSection] = useState<SubNavSection>('general');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notifs, setNotifs] = useState({
    generation: true,
    deployment: true,
    errors: true,
    weekly: false,
  });
  const projectName = 'My Organization App';

  return (
    <AppShell sidebarType="project">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <header className="mb-8">
          <h1 className="text-[28px] font-bold text-slate-900 font-poppins mb-1">Project Settings</h1>
          <p className="text-slate-500 text-sm">Manage settings for {projectName}</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sub-nav */}
          <aside className="lg:w-48 shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-3">
              Project Settings
            </p>
            <nav className="space-y-0.5">
              {SUB_NAV.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                    activeSection === item.id
                      ? 'bg-teal-50 text-[#0F766E] border-l-2 border-[#0F766E] rounded-l-none'
                      : item.id === 'danger'
                      ? 'text-red-500 hover:bg-red-50'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeSection === 'general' && (
                <motion.div key="general" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                    <h2 className="text-lg font-semibold text-slate-800 font-poppins mb-6">Project Information</h2>
                    <div className="space-y-5">
                      <Input label="PROJECT NAME" defaultValue={projectName} />

                      {/* Domain Type (read-only) */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">DOMAIN TYPE</label>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-teal-50 text-[#0F766E] px-4 py-2.5 rounded-xl border border-teal-100 font-semibold text-sm">
                            <Stethoscope size={16} />
                            CLINIC
                          </div>
                          <p className="text-xs text-slate-400 italic">(Cannot be changed after intake)</p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">STATUS</label>
                        <div className="flex items-center gap-3">
                          <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full tracking-wide uppercase">
                            Spec Ready
                          </span>
                          <span className="text-xs text-slate-400">Last updated: 2 hours ago</span>
                        </div>
                      </div>

                      {/* Created */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">CREATED</label>
                        <p className="text-sm text-slate-500 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                          January 15, 2026 at 10:34 AM
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end mt-8">
                      <Button className="px-6 h-10 bg-[#0F766E] hover:bg-[#0D6B63] text-white font-semibold text-sm">
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'notifications' && (
                <motion.div key="notifs" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                    <h2 className="text-lg font-semibold text-slate-800 font-poppins mb-2">Email Notifications</h2>
                    <p className="text-sm text-slate-500 mb-6">Configure which project events send you an email.</p>
                    <ToggleRow
                      label="Notify me when generation completes"
                      description="Sent when the AI finishes generating your application code."
                      checked={notifs.generation}
                      onChange={() => setNotifs(p => ({ ...p, generation: !p.generation }))}
                    />
                    <ToggleRow
                      label="Notify me when deployment goes live"
                      description="Sent when your application is successfully deployed to production."
                      checked={notifs.deployment}
                      onChange={() => setNotifs(p => ({ ...p, deployment: !p.deployment }))}
                    />
                    <ToggleRow
                      label="Notify me on generation errors"
                      description="Sent when the pipeline encounters an error requiring attention."
                      checked={notifs.errors}
                      onChange={() => setNotifs(p => ({ ...p, errors: !p.errors }))}
                    />
                    <ToggleRow
                      label="Weekly project summary"
                      description="A weekly digest of activity for this project."
                      checked={notifs.weekly}
                      onChange={() => setNotifs(p => ({ ...p, weekly: !p.weekly }))}
                    />
                  </div>
                </motion.div>
              )}

              {activeSection === 'team' && (
                <motion.div key="team" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                    <h2 className="text-lg font-semibold text-slate-800 font-poppins mb-2">Team & Access</h2>
                    <p className="text-sm text-slate-500 mb-8">Manage who can view and edit this project.</p>
                    <div className="flex flex-col items-center py-12 text-center">
                      <Users size={48} className="text-slate-200 mb-4" />
                      <h3 className="font-semibold text-slate-500 mb-1">Team collaboration coming soon</h3>
                      <p className="text-sm text-slate-400">Invite team members to collaborate on this project in a future update.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'danger' && (
                <motion.div key="danger" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-1">
                    <h2 className="text-lg font-semibold text-red-600 font-poppins mb-4 flex items-center gap-2">
                      <AlertTriangle size={20} />
                      Danger Zone
                    </h2>

                    {/* Archive Row */}
                    <div className="bg-white rounded-xl border border-red-100 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">Archive this project</p>
                        <p className="text-xs text-slate-500 mt-0.5">Hide this project from your hub. Deployments remain active.</p>
                      </div>
                      <button className="shrink-0 h-9 px-4 text-sm font-semibold text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                        Archive Project
                      </button>
                    </div>

                    {/* Delete Row */}
                    <div className="bg-white rounded-xl border border-red-100 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">Delete this project</p>
                        <p className="text-xs text-slate-500 mt-0.5">Permanently delete all data. This cannot be undone.</p>
                      </div>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="shrink-0 h-9 px-4 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      >
                        Delete Project
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <DeleteModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} projectName={projectName} />
    </AppShell>
  );
};

export default ProjectSettingsPage;
