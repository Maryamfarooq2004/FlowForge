import { create } from 'zustand';
import axiosInstance from '../services/api/axiosInstance';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  organizationType: 'clinic' | 'school';
  businessName?: string;
  logoUrl?: string | null;
  isEmailVerified: boolean;
  role: 'admin' | 'user';
  createdAt: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
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
  refreshToken: async () => {
    try {
      const response = await axiosInstance.post('/api/v1/auth/refresh');
      if (response.data.success) {
        // Success handled by axios interceptor but we can sync state here if needed
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
