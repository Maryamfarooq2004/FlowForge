import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  orgType: 'clinic' | 'school';
  businessName: string;
  logoUrl?: string | null;
  isVerified: boolean;
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
    // Mock login logic
    setTimeout(() => {
      set({ 
        user: {
          id: 'usr_001',
          name: 'Dr. Sara Ahmed',
          email: credentials.email || 'sara@alshifaclinic.com',
          orgType: 'clinic',
          businessName: 'Al-Shifa Clinic',
          isVerified: true,
          role: (credentials.email === 'admin@flowforge.com') ? 'admin' : 'user',
          createdAt: new Date().toISOString()
        },
        isAuthenticated: true,
        isLoading: false
      });
    }, 1500);
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  refreshToken: async () => {
    // Mock refresh logic
  },
}));
