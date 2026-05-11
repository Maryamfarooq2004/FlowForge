import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useProject } from '../../hooks/useProjects';
import { useIntakeBundle } from '../../hooks/useIntake';
import { useQuery } from '@tanstack/react-query';
import intakeService from '../../services/intakeService';
import { CloseEndedForm } from '../../components/features/intake/CloseEndedForm';
import { Skeleton } from '../../components/ui/Skeleton';

const IntakeFormPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  // Fetch Project to get domain/category
  const { data: project, isLoading: isProjectLoading, error: projectError } = useProject(projectId);

  // Fetch Intake Bundle to get existing form data
  const { data: bundle, isLoading: isBundleLoading } = useIntakeBundle(projectId);

  // Fetch Questions based on domain (Legacy method — keeping for now or we could move to useIntake)
  const { data: questions, isLoading: isQuestionsLoading, error: questionsError } = useQuery({
    queryKey: ['intakeQuestions', project?.domain],
    queryFn: async () => {
      // Note: This endpoint might need to be moved to project/intake structure if it's not already
      // But for now we use what works
      const res = await (intakeService as any).getQuestions(project!.domain as 'clinic' | 'school');
      return res;
    },
    enabled: !!project?.domain,
  });

  if (isProjectLoading || isQuestionsLoading || isBundleLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-[400px] w-full max-w-2xl rounded-2xl" />
      </div>
    );
  }

  if (projectError || !project || questionsError || !questions) {
    return <Navigate to="/hub" />;
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
