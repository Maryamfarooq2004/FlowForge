import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CloseEndedForm } from '../../components/features/intake/CloseEndedForm';
import projectService from '../../services/projectService';
import intakeService from '../../services/intakeService';
import { Skeleton } from '../../components/ui/Skeleton';

const IntakeFormPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const { data: project, isLoading: isProjectLoading, error: projectError } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getById(projectId!),
    enabled: !!projectId,
  });

  const { data: questions, isLoading: isQuestionsLoading, error: questionsError } = useQuery({
    queryKey: ['intakeQuestions', project?.category],
    queryFn: () => intakeService.getQuestions(project!.category as 'clinic' | 'school'),
    enabled: !!project?.category,
  });

  if (isProjectLoading || isQuestionsLoading) {
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
      projectId={project._id}
      category={project.category}
      questions={questions}
      initialValues={project.intakeData || {}}
    />
  );
};

export default IntakeFormPage;
