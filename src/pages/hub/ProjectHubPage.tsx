import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, FolderOpen, Sparkles } from 'lucide-react';
import {
  useProjects,
  useIsFirstTimeUser,
  useResumeProject,
  useArchiveProject,
  useDeleteProject,
  useDuplicateProject,
} from '../../hooks/useProjects';
import { useAuthStore } from '../../store/authStore';
import { ProjectCard } from '../../features/projects/components/ProjectCard';
import { ProjectCardSkeleton } from '../../features/projects/components/ProjectCardSkeleton';
import { CreateProjectModal } from '../../features/projects/components/CreateProjectModal';

export default function ProjectHubPage() {
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [initialDomain, setInitialDomain] = useState<'clinic' | 'school' | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'archived'>('all');

  // Handle state from onboarding
  useEffect(() => {
    if (location.state?.openCreateModal) {
      setShowCreateModal(true);
      if (location.state?.domain) {
        setInitialDomain(location.state.domain);
      }
      // Clear state so it doesn't reopen on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // REAL user data from MongoDB via auth store
  const { user } = useAuthStore();

  // REAL projects from MongoDB — filtered to this user only
  const { data, isLoading, isError, refetch } = useProjects();
  const projects = data?.projects ?? [];

  // Check if first time user (no projects in DB)
  const { data: isFirstTime, isLoading: checkingFirstTime } = useIsFirstTimeUser();

  // Mutations
  const { mutate: resumeProject, isPending: isResuming } = useResumeProject();
  const { mutate: archiveProject } = useArchiveProject();
  const { mutate: deleteProject }  = useDeleteProject();
  const { mutate: duplicateProject } = useDuplicateProject();

  // ── LOADING ───────────────────────────────────────────────────
  if (isLoading || checkingFirstTime) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ── ERROR ─────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Failed to load your projects.</p>
          <button
            onClick={() => refetch()}
            className="bg-[#0F766E] text-white px-6 py-2.5 rounded-xl text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── FIRST TIME USER — ONBOARDING WELCOME ─────────────────────
  // ONLY show if user has ZERO projects in MongoDB
  if (isFirstTime && projects.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="max-w-lg text-center">
          {/* Uses REAL user name from MongoDB, never hardcoded */}
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center 
                          justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-[#0F766E]" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 font-poppins mb-3">
            Welcome, {user?.fullName?.split(' ')[0] ?? 'there'}! 👋
          </h1>
          <p className="text-slate-500 text-base mb-2">
            You are all set up with FlowForge.
          </p>
          <p className="text-slate-400 text-sm mb-8">
            Create your first project to start converting your{' '}
            <span className="font-medium text-slate-600">
              {user?.orgType === 'clinic' ? 'clinic' : 'school'}
            </span>
            {' '}workflow into a production-ready application.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#0F766E] hover:bg-[#0D6B63] text-white px-8 py-3.5 
                       rounded-xl font-semibold text-base transition-colors
                       flex items-center gap-2.5 mx-auto shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create Your First Project
          </button>
          <p className="text-xs text-slate-400 mt-4">
            Takes less than 30 minutes · No technical knowledge required
          </p>
        </div>
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setInitialDomain(null);
          }}
          initialDomain={initialDomain}
        />
      </div>
    );
  }

  // ── RETURNING USER — SHOW REAL PROJECTS ───────────────────────
  return (
    <div className="p-8">
      {/* Header — uses REAL user name from MongoDB */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-poppins">
            {/* Real name from auth store — populated from MongoDB */}
            Welcome back, {user?.fullName?.split(' ')[0] ?? 'there'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {projects.length === 1
              ? 'You have 1 active project.'
              : `You have ${projects.length} active projects.`}
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
                : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab === 'all' ? 'All Projects' : 'Archived'}
          </button>
        ))}
      </div>

      {/* REAL Projects Grid — from MongoDB, filtered by logged-in user */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

        {projects.length === 0 ? (
          <div className="col-span-2 flex items-center justify-center py-16">
            <div className="text-center">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No projects yet.</p>
            </div>
          </div>
        ) : (
          // Each card shows REAL project data from MongoDB
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isResuming={isResuming}
              // Clicking open → fetches resume point from DB → navigates
              onOpen={() => resumeProject(project.id)}
              onDuplicate={() => duplicateProject(project.id)}
              onArchive={() => archiveProject(project.id)}
              onDelete={() => deleteProject(project.id)}
            />
          ))
        )}
      </div>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setInitialDomain(null);
        }}
        initialDomain={initialDomain}
      />
    </div>
  );
}
