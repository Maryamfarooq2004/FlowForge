import React, { useState } from 'react';
import { Plus, Search, FolderOpen } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { ProjectCard } from '../../features/projects/components/ProjectCard';
import { CreateProjectModal } from '../../features/projects/components/CreateProjectModal';
import { Skeleton } from '../../components/ui/Skeleton';
import { OnboardingEmpty } from '../../components/shared/OnboardingEmpty';
import projectService from '../../services/projectService';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { cn } from '../../utils/classNames';
import type { ProjectStatus } from '../../components/ui/StatusBadge';

const ProjectHubPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'archived'>('all');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', activeTab],
    queryFn: () => activeTab === 'all' ? projectService.getAll() : projectService.getArchived(),
    staleTime: 30 * 1000,
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => projectService.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project archived successfully');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => projectService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project duplicated successfully');
    },
  });

  const hasNoProjects = !isLoading && (!projects || projects.length === 0) && activeTab === 'all';

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-poppins mb-1">
            {hasNoProjects ? 'Welcome to FlowForge' : 'My Projects'}
          </h1>
          <p className="text-sm text-slate-500 font-medium mb-4">
            {hasNoProjects 
              ? `Let's build your first ${user?.organizationType === 'clinic' ? 'medical' : 'educational'} application.` 
              : `Welcome back, ${user?.fullName?.split(' ')[0]}. Manage your flow generation projects.`}
          </p>
          
          {!hasNoProjects && (
            <div className="flex space-x-6">
              <button 
                onClick={() => setActiveTab('all')}
                className={cn(
                  "pb-2 text-sm font-bold transition-all border-b-2",
                  activeTab === 'all' 
                  ? "text-[#0F766E] border-[#0F766E]" 
                  : "text-slate-400 border-transparent hover:text-slate-600"
                )}
              >
                All Projects
              </button>
              <button 
                onClick={() => setActiveTab('archived')}
                className={cn(
                  "pb-2 text-sm font-bold transition-all border-b-2",
                  activeTab === 'archived' 
                  ? "text-[#0F766E] border-[#0F766E]" 
                  : "text-slate-400 border-transparent hover:text-slate-600"
                )}
              >
                Archived
              </button>
            </div>
          )}
        </div>

        {!hasNoProjects && (
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
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-2xl" />
          ))}
        </div>
      ) : hasNoProjects ? (
        <OnboardingEmpty 
          onCreateProject={() => setIsModalOpen(true)} 
          organizationType={user?.organizationType || 'clinic'} 
        />
      ) : projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'all' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex flex-col items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl hover:bg-slate-100 hover:border-slate-400 transition-all group"
            >
              <div className="h-12 w-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 text-slate-400 group-hover:scale-110 group-hover:text-[#0F766E] transition-all">
                <Plus size={24} />
              </div>
              <span className="text-sm font-bold text-slate-400 group-hover:text-[#0F766E] transition-colors">Create New Project</span>
            </button>
          )}

          {projects.map((project) => (
            <ProjectCard 
              key={project._id}
              id={project._id}
              name={project.name}
              orgName={project.organizationName}
              domain={project.category}
              status={project.status as ProjectStatus}
              updatedAt={project.updatedAt}
              onArchive={() => archiveMutation.mutate(project._id)}
              onDuplicate={() => duplicateMutation.mutate(project._id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <FolderOpen size={48} className="text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium">No {activeTab} projects found.</p>
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
