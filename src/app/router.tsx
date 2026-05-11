import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from '../components/shared/ProtectedRoute';
import { AppShell } from '../components/layout/AppShell';
import LoadingScreen from '../components/shared/LoadingScreen';

// Lazy load all pages for code splitting
const LoginPage         = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage      = lazy(() => import('../pages/auth/RegisterPage'));
const ProjectHubPage    = lazy(() => import('../pages/hub/ProjectHubPage'));
const SettingsPage      = lazy(() => import('../pages/hub/SettingsPage'));
const NotFound          = lazy(() => import('../components/shared/NotFound'));

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
    path: '/hub',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true,       element: withSuspense(ProjectHubPage) },
      { path: 'settings',  element: withSuspense(SettingsPage) },
    ],
  },

  // 404
  { path: '*', element: withSuspense(NotFound) },
]);
