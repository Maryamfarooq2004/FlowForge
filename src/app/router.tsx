import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute, AdminRoute } from '../components/shared/ProtectedRoute';
import { AppShell } from '../components/layout/AppShell';
import LoadingScreen from '../components/shared/LoadingScreen';

// Lazy load all pages for code splitting
const LoginPage         = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage      = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage  = lazy(() => import('../pages/auth/ResetPasswordPage'));
const VerifyEmailPage    = lazy(() => import('../pages/auth/VerifyEmailPage'));
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

// Generation Pages (full-screen, immersive — routed outside AppShell)
const GenerationProgressPage  = lazy(() => import('../pages/generation/GenerationProgressPage'));
const GenerationLogsPage      = lazy(() => import('../pages/generation/GenerationLogsPage'));
const GenerationArtifactsPage = lazy(() => import('../pages/generation/GenerationArtifactsPage'));
const AppPreviewPage          = lazy(() => import('../pages/preview/AppPreviewPage'));
const DeploymentHubPage       = lazy(() => import('../pages/deployment/DeploymentHubPage'));
const ThemeStudioPage         = lazy(() => import('../pages/theme/ThemeStudioPage'));
const DocumentExtractionPage  = lazy(() => import('../pages/documents/DocumentExtractionPage'));

// Admin (role-gated)
const AdminDashboardPage   = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminUsersPage       = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminDeploymentsPage = lazy(() => import('../pages/admin/AdminDeploymentsPage'));
const AdminApiUsagePage    = lazy(() => import('../pages/admin/AdminApiUsagePage'));

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
  {
    path: '/forgot-password',
    element: <PublicOnlyRoute>{withSuspense(ForgotPasswordPage)}</PublicOnlyRoute>,
  },
  {
    path: '/reset-password/:token',
    element: <PublicOnlyRoute>{withSuspense(ResetPasswordPage)}</PublicOnlyRoute>,
  },
  {
    // Standalone (not PublicOnly): a logged-in user clicking their verify link
    // must land here, not be bounced to the hub.
    path: '/verify-email/:token',
    element: withSuspense(VerifyEmailPage),
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
    ],
  },

  // Generation pipeline — full-screen immersive pages (own chrome; no AppShell)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
    ),
    children: [
      { path: 'project/:projectId/generating', element: withSuspense(GenerationProgressPage) },
      { path: 'project/:projectId/logs',       element: withSuspense(GenerationLogsPage) },
      { path: 'project/:projectId/artifacts',  element: withSuspense(GenerationArtifactsPage) },
      { path: 'project/:projectId/preview',    element: withSuspense(AppPreviewPage) },
      { path: 'project/:projectId/deploy',     element: withSuspense(DeploymentHubPage) },
      { path: 'project/:projectId/theme',      element: withSuspense(ThemeStudioPage) },
      { path: 'project/:projectId/documents',  element: withSuspense(DocumentExtractionPage) },
    ],
  },

  // Admin panel — role-gated (admins only), own layout (Navbar + AdminSidebar)
  {
    path: '/',
    element: (
      <AdminRoute>
        <Outlet />
      </AdminRoute>
    ),
    children: [
      { path: 'admin',             element: withSuspense(AdminDashboardPage) },
      { path: 'admin/users',       element: withSuspense(AdminUsersPage) },
      { path: 'admin/deployments', element: withSuspense(AdminDeploymentsPage) },
      { path: 'admin/api-usage',   element: withSuspense(AdminApiUsagePage) },
    ],
  },

  // 404
  { path: '*', element: withSuspense(NotFound) },
]);
