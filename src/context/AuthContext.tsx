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

  // Fetch current user on mount
  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  // Fetch /auth/me to get current user
  const refreshUser = async () => {
    try {
      const currentUser = await authApi.getUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  };

  // Login function
  const login = async (data: LoginData) => {
    try {
      await authApi.login(data);
      await refreshUser(); // update user after login
    } catch (err: unknown) {
      if (err instanceof Error) throw new Error(err.message);
      throw new Error("Login failed");
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
    } catch (err: unknown) {
      if (err instanceof Error) throw new Error(err.message);
      throw new Error("Logout failed");
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    try {
      await authApi.register(data);
      await refreshUser(); // update user after registration
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

// Hook to access AuthContext in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};