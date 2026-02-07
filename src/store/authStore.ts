import { create } from 'zustand';
import { authAPI, setToken, removeToken } from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  nickname?: string;
  lifeStage?: string;
  healingPreference?: string;
  motto?: string;
  onboardingCompleted?: boolean;
  favoriteAudios?: any[];
  createdAudios?: any[];
  followers?: any[];
  following?: any[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  needsOnboarding: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  completeOnboarding: (data: {
    nickname: string;
    lifeStage: string;
    healingPreference: string;
    motto?: string;
  }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  needsOnboarding: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login({ email, password });
      setToken(response.data.token);
      const user = response.data.user;
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        needsOnboarding: !user.onboardingCompleted,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (username: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register({ username, email, password });
      setToken(response.data.token);
      const user = response.data.user;
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        needsOnboarding: true, // 新注册的用户一定需要引导
      });
    } catch (error: any) {
      set({
        error: error.message || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    removeToken();
    set({
      user: null,
      isAuthenticated: false,
      error: null,
      needsOnboarding: false,
    });
  },

  getCurrentUser: async () => {
    set({ isLoading: true });
    try {
      const response = await authAPI.getCurrentUser();
      const user = response.data.user;
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        needsOnboarding: !user.onboardingCompleted,
      });
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        needsOnboarding: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  completeOnboarding: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.completeOnboarding(data);
      set({
        user: response.data.user,
        isLoading: false,
        needsOnboarding: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Onboarding failed',
        isLoading: false,
      });
      throw error;
    }
  },
}));
