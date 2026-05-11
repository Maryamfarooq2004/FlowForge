import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CloseEndedForm } from '../../components/features/intake/CloseEndedForm';
import projectService from '../../services/projectService';
import intakeService from '../../services/intakeService';
import { Skeleton } from '../../components/ui/Skeleton';

const IntakeFormPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  // Fetch Project to get domain/category
  const { data: project, isLoading: isProjectLoading, error: projectError } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await projectService.getProject(projectId!);
      return res.data.data?.project;
    },
    enabled: !!projectId,
  });

  // Fetch Intake Bundle to get existing form data
  const { data: bundle, isLoading: isBundleLoading } = useQuery({
    queryKey: ['intakeBundle', projectId],
    queryFn: () => intakeService.getIntake(projectId!),
    enabled: !!projectId,
  });

  // Fetch Questions based on domain
  const { data: questions, isLoading: isQuestionsLoading, error: questionsError } = useQuery({
    queryKey: ['intakeQuestions', project?.domain],
    queryFn: () => intakeService.getQuestions(project!.domain as 'clinic' | 'school'),
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
      initialValues={bundle?.structuredForm || {}}
    />
  );
};

export default IntakeFormPage;
