import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  targetRole?: string;
  experienceLevel?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { name: string; email: string; password: string; targetRole?: string; experienceLevel?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // starts true so we can check session on mount
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      set({ user: res.data.data.user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Login failed';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', data);
      set({ user: res.data.data.user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore — clear local state regardless
    }
    set({ user: null, isAuthenticated: false });
  },

  checkSession: async () => {
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  clearError: () => set({ error: null }),
}));
