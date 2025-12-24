import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import api, { storage } from '../services/api';
import { Role, User } from '../types';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload extends LoginPayload {
  name: string;
  role?: Role;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  isMerchant: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile() {
  const response = await api.get('/auth/profile');
  return response.data.data as User;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => storage.getToken());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const hydrate = async () => {
      if (!token) {
        setLoading(false);
        setUser(null);
        return;
      }
      try {
        const profile = await fetchProfile();
        if (!ignore) {
          setUser(profile);
        }
      } catch (error) {
        storage.clearToken();
        if (!ignore) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    hydrate();
    return () => {
      ignore = true;
    };
  }, [token]);

  const login = useCallback(async (payload: LoginPayload): Promise<User> => {
    const { data } = await api.post('/auth/login', payload);
    storage.setToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<User> => {
    await api.post('/auth/register', payload);
    return login({ email: payload.email, password: payload.password });
  }, [login]);

  const logout = useCallback(() => {
    storage.clearToken();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAdmin: user?.role === 'admin',
      isMerchant: user?.role === 'merchant',
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
