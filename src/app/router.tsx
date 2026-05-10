import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Spinner } from '../components/ui/Spinner';
import { ProtectedRoute, AdminRoute } from '../components/auth/ProtectedRoute';
import { RouteError } from '../components/shared/RouteError';

// Lazy load pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const CheckEmailPage = lazy(() => import('../pages/auth/CheckEmailPage'));
const VerifyEmailPage = lazy(() => import('../pages/auth/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));
const OnboardingPage = lazy(() => import('../pages/onboarding/OnboardingPage'));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminDeploymentsPage = lazy(() => import('../pages/admin/AdminDeploymentsPage'));
const AdminApiUsagePage = lazy(() => import('../pages/admin/AdminApiUsagePage'));
const ProjectHubPage = lazy(() => import('../pages/hub/ProjectHubPage'));
const SettingsPage = lazy(() => import('../pages/hub/SettingsPage'));
const DomainSelectionPage = lazy(() => import('../pages/intake/DomainSelectionPage'));
const IntakeFormPage = lazy(() => import('../pages/intake/IntakeFormPage'));
const GuidedIntakePage = lazy(() => import('../pages/intake/GuidedIntakePage'));
const IntakeReviewPage = lazy(() => import('../pages/intake/IntakeReviewPage'));
const DocumentExtractionPage = lazy(() => import('../pages/documents/DocumentExtractionPage'));
const ThemeStudioPage = lazy(() => import('../pages/theme/ThemeStudioPage'));
const BlueprintReviewPage = lazy(() => import('../pages/spec/BlueprintReviewPage'));
const AlertsSetupPage = lazy(() => import('../pages/notifications/AlertsSetupPage'));
const GenerationProgressPage = lazy(() => import('../pages/generation/GenerationProgressPage'));
const AppPreviewPage = lazy(() => import('../pages/preview/AppPreviewPage'));
const DeploymentHubPage = lazy(() => import('../pages/deployment/DeploymentHubPage'));
const LandingPage = lazy(() => import('../pages/LandingPage'));
const NotFound = lazy(() => import('../components/shared/NotFound'));
// Batch B pages
const NotificationsPage = lazy(() => import('../pages/hub/NotificationsPage'));
const ArchivedProjectsPage = lazy(() => import('../pages/hub/ArchivedProjectsPage'));
const SupportPage = lazy(() => import('../pages/hub/SupportPage'));
const ProjectSettingsPage = lazy(() => import('../pages/projects/ProjectSettingsPage'));

// Batch D pages
const GenerationLogsPage = lazy(() => import('../pages/generation/GenerationLogsPage'));
const GenerationArtifactsPage = lazy(() => import('../pages/generation/GenerationArtifactsPage'));
const WorkflowsOverviewPage = lazy(() => import('../pages/notifications/WorkflowsOverviewPage'));
const InfrastructurePage = lazy(() => import('../pages/infrastructure/InfrastructurePage'));

// Loading screen
const LoadingScreen = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-[#F8FAFC]">
    <Spinner className="h-10 w-10 text-[#0F766E]" />
  </div>
);

const routes = [
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <RegisterPage />
      </Suspense>
    ),
  },
  {
    path: '/check-email',
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <CheckEmailPage />
      </Suspense>
    ),
  },
  {
    path: '/verify-email/:token',
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <VerifyEmailPage />
      </Suspense>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <ForgotPasswordPage />
      </Suspense>
    ),
  },
  {
    path: '/reset-password/:token',
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <ResetPasswordPage />
      </Suspense>
    ),
  },
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <OnboardingPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/hub',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <ProjectHubPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/hub/settings',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <SettingsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/hub/notifications',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <NotificationsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/hub/archived',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <ArchivedProjectsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/hub/support',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <SupportPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/project/new/domain',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <DomainSelectionPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/project/:projectId/settings',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <ProjectSettingsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/project/:projectId/intake/form',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <IntakeFormPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/project/:projectId/intake/story',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <GuidedIntakePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/project/:projectId/intake/roles',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <GuidedIntakePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/project/:projectId/intake/review',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <IntakeReviewPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/project/:projectId/documents',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <DocumentExtractionPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/project/:projectId/theme',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <ThemeStudioPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/project/:projectId/blueprint',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <BlueprintReviewPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/project/:projectId/alerts',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <AlertsSetupPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/project/:projectId/generating',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <GenerationProgressPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/project/:projectId/logs',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <GenerationLogsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/project/:projectId/artifacts',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <GenerationArtifactsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/project/:projectId/workflows',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <WorkflowsOverviewPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/project/:projectId/infrastructure',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <InfrastructurePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/project/:projectId/preview',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <AppPreviewPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/project/:projectId/deploy',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingScreen />}>
          <DeploymentHubPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  // Admin Routes
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <Suspense fallback={<LoadingScreen />}>
          <AdminDashboardPage />
        </Suspense>
      </AdminRoute>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <AdminRoute>
        <Suspense fallback={<LoadingScreen />}>
          <AdminUsersPage />
        </Suspense>
      </AdminRoute>
    ),
  },
  {
    path: '/admin/deployments',
    element: (
      <AdminRoute>
        <Suspense fallback={<LoadingScreen />}>
          <AdminDeploymentsPage />
        </Suspense>
      </AdminRoute>
    ),
  },
  {
    path: '/admin/api-usage',
    element: (
      <AdminRoute>
        <Suspense fallback={<LoadingScreen />}>
          <AdminApiUsagePage />
        </Suspense>
      </AdminRoute>
    ),
  },
  // Catch all
  {
    path: '*',
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <NotFound />
      </Suspense>
    ),
  },
];

export const router = createBrowserRouter(
  routes.map(route => ({
    ...route,
    errorElement: <RouteError />
  }))
);
