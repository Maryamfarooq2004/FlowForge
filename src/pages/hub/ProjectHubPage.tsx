import React, { useState } from 'react';
import { Plus, FolderOpen, Search } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { ProjectCard } from '../../features/projects/components/ProjectCard';
import { CreateProjectModal } from '../../features/projects/components/CreateProjectModal';
import { mockProjects } from '../../constants/mockData';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import type { ProjectStatus } from '../../components/ui/StatusBadge';
import { useAuthStore } from '../../store/authStore';

const ProjectHubPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'archived'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  
  // Special handling for Dr. Maryam (Dummy Data)
  const isDrMaryam = user?.email?.toLowerCase() === 'maryamfarooqkhan2004@gmail.com';
  
  const projects = isDrMaryam 
    ? (mockProjects as any[]).filter(p => {
        if (activeTab === 'archived') return p.status === 'ARCHIVED';
        return p.status !== 'ARCHIVED';
      })
    : []; // Empty for any other user (Live mode)

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-poppins mb-1">
            Welcome back, {user?.fullName?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-sm text-slate-500 font-medium mb-4">
            Manage and monitor your flow generation projects.
          </p>
          <div className="flex space-x-6">
            <button 
              onClick={() => setActiveTab('all')}
              className={`pb-2 text-sm font-bold transition-all border-b-2 ${
                activeTab === 'all' 
                ? 'text-[#0F766E] border-[#0F766E]' 
                : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              All Projects
            </button>
            <button 
              onClick={() => setActiveTab('archived')}
              className={`pb-2 text-sm font-bold transition-all border-b-2 ${
                activeTab === 'archived' 
                ? 'text-[#0F766E] border-[#0F766E]' 
                : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              Archived
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="pl-9 pr-4 h-9 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all w-64"
            />
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="h-9 px-4">
            <Plus size={18} className="mr-2" /> New Project
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-2xl" />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex flex-col items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl hover:bg-slate-100 hover:border-slate-400 transition-all group"
          >
            <div className="h-12 w-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 text-slate-400 group-hover:scale-110 group-hover:text-[#0F766E] transition-all">
              <Plus size={24} />
            </div>
            <span className="text-sm font-bold text-slate-400 group-hover:text-[#0F766E] transition-colors">Create New Project</span>
          </button>

          {projects.map((project) => (
            <ProjectCard 
              key={project.id}
              id={project.id}
              name={project.name}
              orgName={project.orgName}
              domain={project.domain as 'clinic' | 'school'}
              status={project.status as ProjectStatus}
              updatedAt={project.updatedAt}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <EmptyState 
            icon={<FolderOpen size={48} className="text-slate-200" />}
            title="No projects yet"
            subtitle="Create your first project to get started with FlowForge."
            actionLabel="+ New Project"
            onAction={() => setIsModalOpen(true)}
          />
        </div>
      )}

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </AppShell>
  );
};

export default ProjectHubPage;
