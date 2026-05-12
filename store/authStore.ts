import { create } from 'zustand';
import { auth } from '../lib/auth';

interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  login: async (email, password) => {
    set({ loading: true, error: null });
    const result = await auth.login(email, password);
    if (result.success) {
      set({ user: result.user, loading: false });
      return true;
    } else {
      set({ error: result.error, loading: false });
      return false;
    }
  },
  logout: async () => {
    await auth.logout();
    set({ user: null });
  },
  checkAuth: async () => {
    set({ loading: true });
    try {
      const response = await auth.getMe();
      // If the backend returns the user object directly, it might not have 'success'
      const userData = response.user || response.data || (response.id ? response : null);
      
      if (userData) {
        set({ user: userData, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch (e) {
      set({ user: null, loading: false });
    }
  },
}));
