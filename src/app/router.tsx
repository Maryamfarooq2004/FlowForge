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
const NotFound          = lazy(() => import('../components/shared/NotFound'));

// Intake Pages
const IntakeFormPage    = lazy(() => import('../pages/intake/IntakeFormPage'));
const GuidedIntakePage  = lazy(() => import('../pages/intake/GuidedIntakePage'));
const IntakeReviewPage  = lazy(() => import('../pages/intake/IntakeReviewPage'));

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
    ],
  },

  // 404
  { path: '*', element: withSuspense(NotFound) },
]);
