import React from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useProject } from '../../hooks/useProjects';
import { useIntakeBundle } from '../../hooks/useIntake';
import { useQuery } from '@tanstack/react-query';
import intakeService from '../../services/intakeService';
import { CloseEndedForm } from '../../components/features/intake/CloseEndedForm';
import { Skeleton } from '../../components/ui/Skeleton';

const IntakeFormPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading: isProjectLoading, error: projectError } = useProject(projectId);
  const { data: bundle, isLoading: isBundleLoading } = useIntakeBundle(projectId);

  const {
    data: questions,
    isLoading: isQuestionsLoading,
    error: questionsError,
    refetch: refetchQuestions,
  } = useQuery({
    queryKey: ['intakeQuestions', project?.domain],
    queryFn: () => intakeService.getQuestions(project!.domain as 'clinic' | 'school'),
    enabled: !!project?.domain,
    retry: 1,
  });

  if (isProjectLoading || isQuestionsLoading || isBundleLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-[400px] w-full max-w-2xl rounded-2xl" />
      </div>
    );
  }

  // Only the project genuinely missing warrants leaving the intake flow.
  if (projectError || !project) {
    return <Navigate to="/hub" replace />;
  }

  // Questions failed or came back empty — show a real, recoverable error instead
  // of silently bouncing the user to the hub.
  if (questionsError || !questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Couldn't load the intake questions</h2>
          <p className="text-slate-500 text-sm mb-6">
            {questionsError
              ? 'There was a problem reaching the server. Please try again.'
              : `No questions are configured for the "${project.domain}" category yet.`}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => refetchQuestions()}
              className="bg-[#0F766E] hover:bg-[#0D6B63] text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
            >
              Try again
            </button>
            <button
              onClick={() => navigate('/hub')}
              className="border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50"
            >
              Back to hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CloseEndedForm
      projectId={project.id}
      category={project.domain as 'clinic' | 'school'}
      questions={questions}
      initialValues={bundle?.structuredFormData || {}}
    />
  );
};

export default IntakeFormPage;
