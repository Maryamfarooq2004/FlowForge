import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from '../components/shared/ProtectedRoute';
import { AppShell } from '../components/layout/AppShell';
import LoadingScreen from '../components/shared/LoadingScreen';

// Lazy load all pages for code splitting
const LoginPage         = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage      = lazy(() => import('../pages/auth/RegisterPage'));
const ProjectHubPage    = lazy(() => import('../pages/hub/ProjectHubPage'));
const ArchivedProjectsPage = lazy(() => import('../pages/hub/ArchivedProjectsPage'));
const SupportPage       = lazy(() => import('../pages/hub/SupportPage'));
const OnboardingPage    = lazy(() => import('../pages/onboarding/OnboardingPage'));
const SettingsPage      = lazy(() => import('../pages/hub/SettingsPage'));
const NotificationsPage = lazy(() => import('../pages/hub/NotificationsPage'));
const NotFound          = lazy(() => import('../components/shared/NotFound'));

// Intake Pages
const IntakeFormPage    = lazy(() => import('../pages/intake/IntakeFormPage'));
const GuidedIntakePage  = lazy(() => import('../pages/intake/GuidedIntakePage'));
const IntakeReviewPage  = lazy(() => import('../pages/intake/IntakeReviewPage'));
const BlueprintReviewPage = lazy(() => import('../pages/spec/BlueprintReviewPage'));
const AlertsSetupPage    = lazy(() => import('../pages/notifications/AlertsSetupPage'));
const WorkflowsPage      = lazy(() => import('../pages/notifications/WorkflowsOverviewPage'));

const withSuspense = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  // Redirect root to hub
  { path: '/', element: <Navigate to="/hub" replace /> },

  // Public auth routes
  {
    path: '/login',
    element: <PublicOnlyRoute>{withSuspense(LoginPage)}</PublicOnlyRoute>,
  },
  {
    path: '/register',
    element: <PublicOnlyRoute>{withSuspense(RegisterPage)}</PublicOnlyRoute>,
  },

  // Protected app routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { path: 'hub',              element: withSuspense(ProjectHubPage) },
      { path: 'hub/archived',     element: withSuspense(ArchivedProjectsPage) },
      { path: 'hub/support',      element: withSuspense(SupportPage) },
      { path: 'onboarding',       element: withSuspense(OnboardingPage) },
      { path: 'hub/settings',     element: withSuspense(SettingsPage) },
      { path: 'hub/notifications', element: withSuspense(NotificationsPage) },
      
      // Project Placeholders
      { path: 'project/:projectId/logs',           element: <div className="p-8 text-center"><h1 className="text-xl font-bold">Logs (Coming Soon)</h1></div> },
      { path: 'project/:projectId/artifacts',      element: <div className="p-8 text-center"><h1 className="text-xl font-bold">Artifacts (Coming Soon)</h1></div> },
      { path: 'project/:projectId/workflows',      element: <div className="p-8 text-center"><h1 className="text-xl font-bold">Workflows (Coming Soon)</h1></div> },
      { path: 'project/:projectId/infrastructure', element: <div className="p-8 text-center"><h1 className="text-xl font-bold">Infrastructure (Coming Soon)</h1></div> },
      
      // Intake Flow
      { path: 'project/:projectId/intake/form', element: withSuspense(IntakeFormPage) },
      { 
        path: 'project/:projectId/intake/story', 
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <GuidedIntakePage screenSlug="story" />
          </Suspense>
        ) 
      },
      { 
        path: 'project/:projectId/intake/roles', 
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <GuidedIntakePage screenSlug="roles" />
          </Suspense>
        ) 
      },
      { 
        path: 'project/:projectId/intake/data', 
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <GuidedIntakePage screenSlug="data" />
          </Suspense>
        ) 
      },
      { 
        path: 'project/:projectId/intake/rules', 
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <GuidedIntakePage screenSlug="rules" />
          </Suspense>
        ) 
      },
      { path: 'project/:projectId/intake/review', element: withSuspense(IntakeReviewPage) },
      { path: 'project/:projectId/spec',          element: withSuspense(BlueprintReviewPage) },
      { path: 'project/:projectId/alerts',        element: withSuspense(AlertsSetupPage) },
      { path: 'project/:projectId/workflows',     element: withSuspense(WorkflowsPage) },
      { path: 'project/:projectId/generating',    element: <Navigate to="../spec" replace /> },
    ],
  },

  // 404
  { path: '*', element: withSuspense(NotFound) },
]);
