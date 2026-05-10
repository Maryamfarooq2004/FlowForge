import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import authService from '../services/authService';

export const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const { setUser, setAccessToken, setAuthenticated, setInitialized, isInitialized } =
    useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Attempt to get current user using httpOnly cookie
        const { data } = await authService.getMe();
        // Note: getMe calls /auth/me which uses protect middleware
        // If access token is expired, interceptor will refresh it first
        setUser(data.data.user);
        setAuthenticated(true);
      } catch {
        // No valid session — user needs to log in
        // clearAuth is called by the interceptor already
      } finally {
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Block rendering until we know auth state
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#0F766E] border-t-transparent 
                          rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading FlowForge...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
