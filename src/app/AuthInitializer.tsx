import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import authService from '../services/authService';

interface Props {
  children: React.ReactNode;
}

export const AuthInitializer = ({ children }: Props) => {
  const { setUser, setAccessToken, setAuthenticated, setInitialized, isInitialized } =
    useAuthStore();

  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      try {
        // Try refresh first to get fresh access token from httpOnly cookie
        const refreshResponse = await authService.refreshToken();
        
        if (cancelled) return;

        const { user, accessToken } = refreshResponse.data.data!;
        setAccessToken(accessToken);
        setUser(user);
        setAuthenticated(true);
      } catch {
        // No valid session — user must log in
        if (!cancelled) {
          useAuthStore.getState().clearAuth();
        }
      } finally {
        if (!cancelled) {
          setInitialized(true);
        }
      }
    };

    initAuth();

    return () => {
      cancelled = true;
    };
  }, []); // Runs once on mount

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-full border-[3px] border-[#0F766E] 
                       border-t-transparent animate-spin"
          />
          <p className="text-sm text-slate-500 font-medium">Loading FlowForge...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
