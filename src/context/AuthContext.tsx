import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, LoginData, RegisterData } from "../types/auth";
import * as authApi from "../api/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Only call /auth/me on mount if a token already exists
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }
    refreshUser().finally(() => setLoading(false));
  }, []);

  // Fetch /auth/me to rehydrate session (e.g. on page refresh)
  const refreshUser = async () => {
    const currentUser = await authApi.getUser(); // never throws, returns null on failure
    setUser(currentUser);
  };

  // Set user directly from login response — no extra /auth/me round trip needed
  const login = async (data: LoginData) => {
    try {
      const user = await authApi.login(data);
      setUser(user);
    } catch (err: unknown) {
      if (err instanceof Error) throw new Error(err.message);
      throw new Error("Login failed");
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
    } catch (err: unknown) {
      if (err instanceof Error) throw new Error(err.message);
      throw new Error("Logout failed");
    }
  };

  // Set user directly from register response — no extra /auth/me round trip needed
  const register = async (data: RegisterData) => {
    try {
      const user = await authApi.register(data);
      setUser(user);
    } catch (err: unknown) {
      if (err instanceof Error) throw new Error(err.message);
      throw new Error("Registration failed");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
