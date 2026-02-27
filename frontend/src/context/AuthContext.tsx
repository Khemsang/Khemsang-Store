import {
  createContext,
  useContext,
  useState,
  useEffect,
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
  signup: (
    name: string,
    email: string,
    password: string,
    isAdmin?: boolean
  ) => Promise<any>;
  logout: () => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<any>;
  resendOTP: (email: string) => Promise<any>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch (error: any) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    isAdmin?: boolean
  ) => {
    const { data } = await api.post("/auth/signup", {
      name,
      email,
      password,
      isAdmin,
    });
    return data;
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      // Set user immediately if OTP is not required (Super Admin case)
      if (!response.data.needsOTP && response.data.user) {
        setUser(response.data.user);
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  const verifyOTP = async (email: string, otp: string) => {
    const { data } = await api.post("/auth/verify-otp", { email, otp });
    // Set user after successful OTP verification
    if (data.user) {
      setUser(data.user);
    }
    return data;
  };

  const resendOTP = async (email: string) => {
    const { data } = await api.post("/auth/resend-otp", { email });
    return data;
  };

  const updateUser = (userData: Partial<User> | User) => {
    if (userData && "_id" in userData) {
      // Full user object - replace entirely
      setUser(userData as User);
    } else {
      // Partial update
      setUser((prevUser) => (prevUser ? { ...prevUser, ...userData } : null));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        verifyOTP,
        resendOTP,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
