import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Spinner } from '../ui/Spinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F8FAFC]">
        <Spinner className="h-10 w-10 text-[#0F766E]" />
      </div>
    );
  }
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};
export const AdminRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F8FAFC]">
        <Spinner className="h-10 w-10 text-[#0F766E]" />
      </div>
    );
  }
  
  if (user?.role !== 'admin') return <Navigate to="/hub" replace />;
  
  return <>{children}</>;
};
