import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../../components/shared/Logo';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/classNames';
import { Bell, HelpCircle } from 'lucide-react';
import { WorkflowGraph } from '../../components/features/spec/WorkflowGraph';

import { useAuthStore } from '../../store/authStore';
import { useProject } from '../../hooks/useProjects';
import { useSpec } from '../../hooks/useSpec';
import type { ApiError } from '../../types/global.types';

const WorkflowsOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useAuthStore();
  const { data: project } = useProject(projectId);
  const specQuery = useSpec(projectId);
  const spec = specQuery.data;
  const specStatus = (specQuery.error as ApiError | null)?.response?.status;
  const noSpecYet = specQuery.isError && specStatus === 404;
  const [activeTab, setActiveTab] = useState<'alerts' | 'workflows'>('workflows');

  const NAV_TABS = [
    { id: 'workflows', label: 'Workflows' },
    { id: 'alerts', label: 'Alerts Setup' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Navbar */}
      <nav className="h-14 bg-[#134E4A] flex items-center justify-between px-6 shrink-0 z-50 sticky top-0">
        <div className="flex items-center space-x-6">
          <Logo size="sm" variant="light" useSecondary={true} />
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span className="text-white/50">{project?.name || 'My Organization'}</span>
            <span className="text-white/30">›</span>
            <span className="text-white">Workflows</span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {NAV_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'alerts') navigate(`/project/${projectId || 'new'}/alerts`);
              }}
              className={cn(
                'text-sm font-bold pb-1 mt-1 border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'text-white border-white'
                  : 'text-white/40 hover:text-white/70 border-transparent'
              )}
            >
              {tab.label}
            </button>
          ))}
          <button className="text-sm font-bold text-white/40 hover:text-white/70 transition-colors pb-1 mt-1 border-b-2 border-transparent">Dashboard</button>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/hub/notifications')}
            className="text-white/70 hover:text-white"
          >
            <Bell size={20} />
          </button>
          <button 
            onClick={() => navigate('/hub/support')}
            className="text-white/70 hover:text-white"
          >
            <HelpCircle size={20} />
          </button>
          <div className="flex items-center gap-3">
            <Avatar name={user?.fullName || "User"} size="sm" className="bg-[#34D399] text-[#134E4A]" />
            <span className="text-sm font-semibold text-white hidden lg:block">{user?.fullName}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 font-poppins">Workflow States & Transitions</h1>
            <p className="text-slate-500 mt-1 text-sm">
              The stages, moves, and role permissions from {project?.name || 'this project'}'s approved blueprint.
            </p>
          </div>

          {/* Real workflow, from the project's WorkflowSpec */}
          {specQuery.isLoading ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center text-sm text-slate-400">
              Loading workflow…
            </div>
          ) : noSpecYet || !spec ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
              <p className="text-slate-600 font-medium mb-1">No workflow blueprint yet</p>
              <p className="text-slate-400 text-sm mb-5">
                Build one in the Spec Studio to see its states, moves, and roles here.
              </p>
              <Button
                className="bg-[#0F766E] hover:bg-[#0D6B63] text-white"
                onClick={() => navigate(`/project/${projectId || 'new'}/spec`)}
              >
                Go to Spec Studio →
              </Button>
            </div>
          ) : (
            <WorkflowGraph states={spec.states} transitions={spec.transitions} roles={spec.roles} />
          )}

          {/* Footer actions */}
          <div className="flex justify-end gap-3 mt-8">
            <Button variant="outline" onClick={() => navigate(`/project/${projectId || 'new'}/spec`)}>
              ← Back to Blueprint
            </Button>
            <Button
              className="bg-[#0F766E] hover:bg-[#0D6B63] text-white px-6"
              onClick={() => navigate(`/project/${projectId || 'new'}/alerts`)}
            >
              Set Up Alerts →
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkflowsOverviewPage;
