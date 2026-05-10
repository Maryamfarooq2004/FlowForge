import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CloseEndedForm } from '../../components/features/intake/CloseEndedForm';
import { CLINIC_INTAKE_QUESTIONS } from '../../data/clinicIntakeForm';
import { SCHOOL_INTAKE_QUESTIONS } from '../../data/schoolIntakeForm';
import projectService from '../../services/projectService';
import { Skeleton } from '../../components/ui/Skeleton';

const IntakeFormPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getById(projectId!),
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-[400px] w-full max-w-2xl rounded-2xl" />
      </div>
    );
  }

  if (error || !project) {
    return <Navigate to="/hub" />;
  }

  const questions = project.category === 'clinic' 
    ? CLINIC_INTAKE_QUESTIONS 
    : SCHOOL_INTAKE_QUESTIONS;

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
