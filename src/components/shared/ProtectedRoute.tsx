import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface Props {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: Props) => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const location = useLocation();

  // AuthInitializer handles loading state
  // By the time ProtectedRoute renders, isInitialized is always true
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return <>{children}</>;
};

// Redirect authenticated users away from auth pages
export const PublicOnlyRoute = ({ children }: Props) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/hub" replace />;
  }

  return <>{children}</>;
};
