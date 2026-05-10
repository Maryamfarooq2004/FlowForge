import { create } from 'zustand';
import axiosInstance from '../services/api/axiosInstance';

export interface User {
  id: string;
  fullName: string;
  email: string;
  orgType: 'clinic' | 'school';
  businessName?: string;
  logoUrl?: string | null;
  role: 'admin' | 'user';
  createdAt: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setAuthenticated: (val: boolean) => void;
  setInitialized: (val: boolean) => void;
  clearAuth: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.post('/api/v1/auth/login', credentials);
      if (response.data.success) {
        set({ 
          user: response.data.data.user,
          isAuthenticated: true,
          isLoading: false
        });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post('/api/v1/auth/logout');
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAuthenticated: (val) => set({ isAuthenticated: val }),
  setInitialized: (val) => set({ isInitialized: val }),
  clearAuth: () => set({ user: null, isAuthenticated: false }),
  refreshToken: async () => {
    try {
      const response = await axiosInstance.post('/api/v1/auth/refresh');
      if (response.data.success) {
        // Success handled by axios interceptor
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
