import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { useAuthStore } from '../store/authStore';
import axiosInstance from '../services/api/axiosInstance';
import LoadingScreen from '../components/shared/LoadingScreen';

const queryClient = new QueryClient();

function App() {
  const { isInitialized, setInitialized, setUser, clearAuth } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await axiosInstance.get('/api/v1/auth/me');
        if (response.data.success) {
          setUser(response.data.data.user);
        } else {
          clearAuth();
        }
      } catch (error) {
        clearAuth();
      } finally {
        setInitialized(true);
      }
    };
    initAuth();
  }, [setInitialized, setUser, clearAuth]);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
