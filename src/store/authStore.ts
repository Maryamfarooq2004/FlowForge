import { create } from 'zustand';

interface User {
  id: string;
  fullName: string;
  email: string;
  orgType: 'clinic' | 'school';
  businessName?: string;
  logoUrl?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;  // true after silent refresh attempt on app load
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setInitialized: (value: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  setUser: (user) => set({ user }),
  setAccessToken: (token) => set({ accessToken: token }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setLoading: (value) => set({ isLoading: value }),
  setInitialized: (value) => set({ isInitialized: value }),
  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitialized: true,
    }),
}));
