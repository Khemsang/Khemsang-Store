import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { api } from "../services/api";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role?: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isVerified: boolean;
  adminStatus?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (name: string, email: string, password: string, isAdmin?: boolean) => Promise<any>;
  logout: () => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<any>;
  resendOTP: (email: string) => Promise<any>;
  updateUser: (userData: Partial<User> | User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signup = useCallback(
    (name: string, email: string, password: string, isAdmin?: boolean) =>
      api
        .post("/auth/signup", { name, email, password, isAdmin })
        .then(({ data }) => data),
    []
  );

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (!data.needsOTP && data.user) setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout");
    setUser(null);
  }, []);

  const verifyOTP = useCallback(async (email: string, otp: string) => {
    const { data } = await api.post("/auth/verify-otp", { email, otp });
    if (data.user) setUser(data.user);
    return data;
  }, []);

  const resendOTP = useCallback(
    (email: string) =>
      api.post("/auth/resend-otp", { email }).then(({ data }) => data),
    []
  );

  const updateUser = useCallback((userData: Partial<User> | User) => {
    setUser((prev) =>
      "_id" in userData
        ? (userData as User)
        : prev
        ? { ...prev, ...userData }
        : null
    );
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, verifyOTP, resendOTP, updateUser }),
    [user, loading, login, signup, logout, verifyOTP, resendOTP, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
