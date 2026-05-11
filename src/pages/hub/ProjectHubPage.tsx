import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen } from 'lucide-react';
import { useProjects, useArchiveProject, useDeleteProject, useDuplicateProject } from '../../hooks/useProjects';
import { useAuthStore } from '../../store/authStore';
import { CreateProjectModal } from '../../features/projects/components/CreateProjectModal';
import { ProjectCard } from '../../features/projects/components/ProjectCard';
import { ProjectCardSkeleton } from '../../features/projects/components/ProjectCardSkeleton';
import type { Project } from '../../types/project.types';

export default function ProjectHubPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'archived'>('all');

  // ── FETCH DATA FROM MONGODB VIA REACT QUERY ──────────────
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useProjects();

  const projects = data?.projects ?? [];

  const { mutate: archiveProject } = useArchiveProject();
  const { mutate: deleteProject } = useDeleteProject();
  const { mutate: duplicateProject } = useDuplicateProject();

  const handleOpenProject = (project: Project) => {
    navigate(`/project/${project.id || project._id}/intake/form`);
  };

  // ── LOADING STATE ─────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-slate-100 rounded-lg animate-pulse mt-2" />
          </div>
          <div className="h-10 w-36 bg-slate-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ── ERROR STATE ───────────────────────────────────────────
  if (isError) {
    const errMsg = (error as any)?.response?.data?.message || 'Failed to load projects.';
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl border border-red-100 p-10 text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center 
                          justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Failed to Load Projects
          </h3>
          <p className="text-sm text-slate-500 mb-6">{errMsg}</p>
          <button
            onClick={() => refetch()}
            className="bg-[#0F766E] text-white px-6 py-2.5 rounded-lg 
                       text-sm font-medium hover:bg-[#0D6B63] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── EMPTY STATE ───────────────────────────────────────────
  const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center 
                    py-20 text-center">
      <div className="w-20 h-20 bg-teal-50 rounded-2xl flex items-center 
                      justify-center mb-4">
        <FolderOpen className="w-10 h-10 text-[#0F766E]" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">
        No projects yet
      </h3>
      <p className="text-sm text-slate-500 mb-6 max-w-xs">
        Create your first project to start generating your business application.
      </p>
      <button
        onClick={() => setShowCreateModal(true)}
        className="bg-[#0F766E] text-white px-6 py-2.5 rounded-lg 
                   text-sm font-semibold hover:bg-[#0D6B63] transition-colors
                   flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Create First Project
      </button>
    </div>
  );

  // ── LOADED STATE ──────────────────────────────────────────
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-poppins">
            My Projects
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, {user?.fullName?.split(' ')[0]}. 
            {projects.length > 0
              ? ` You have ${projects.length} active project${projects.length !== 1 ? 's' : ''}.`
              : ' Create your first project to get started.'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#0F766E] hover:bg-[#0D6B63] 
                     text-white px-5 py-2.5 rounded-xl font-semibold text-sm 
                     transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {(['all', 'archived'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors
              ${activeTab === tab
                ? 'text-[#0F766E] border-b-2 border-[#0F766E]'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {tab === 'all' ? 'All Projects' : 'Archived'}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Create new card */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="border-2 border-dashed border-slate-300 rounded-2xl p-8
                     hover:border-[#0F766E] hover:bg-teal-50/30 transition-all
                     flex flex-col items-center justify-center gap-3 
                     text-slate-400 hover:text-[#0F766E] min-h-[180px] group"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-teal-100 
                          flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium">Create New Project</span>
        </button>

        {/* Real project cards from MongoDB */}
        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project.id || project._id}
              project={project}
              onOpen={() => handleOpenProject(project)}
              onDuplicate={() => duplicateProject(project.id || project._id!)}
              onArchive={() => archiveProject(project.id || project._id!)}
              onDelete={() => deleteProject(project.id || project._id!)}
            />
          ))
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
