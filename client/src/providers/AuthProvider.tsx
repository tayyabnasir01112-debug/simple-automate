import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, setAccessToken } from '../lib/api';

export type User = {
  id: string;
  email: string;
  emailVerified: boolean;
  subscriptionStatus: string;
  trialEndsAt?: string | null;
  createdAt?: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  signup: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get<{ user: User }>('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('sa_access');
    if (!stored) {
      setLoading(false);
      return;
    }

    setAccessToken(stored);
    fetchProfile().finally(() => setLoading(false));
  }, [fetchProfile]);

  const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
    const { data } = await api.post<{ user: User; accessToken: string }>('/auth/login', {
      email,
      password,
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const signup = useCallback(async ({ email, password }: { email: string; password: string }) => {
    const { data } = await api.post<{ user: User; accessToken: string }>('/auth/signup', {
      email,
      password,
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout');
    setAccessToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
      refreshProfile: fetchProfile,
    }),
    [user, loading, login, signup, logout, fetchProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

