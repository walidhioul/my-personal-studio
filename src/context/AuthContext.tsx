import { createContext, useContext, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

/** Single source of truth for the /auth/me cache. */
export const authKeys = {
  me: ["auth", "me"] as const,
};

const hasToken = () => Boolean(localStorage.getItem("auth_token"));

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const qc = useQueryClient();

  // /auth/me is a React Query cache entry: one request per session (even under
  // StrictMode double-mount), shared by every consumer of useAuth().
  const { data: user = null, isLoading } = useQuery({
    queryKey: authKeys.me,
    queryFn: authApi.getUser, // never throws, resolves null on failure
    enabled: hasToken(),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });

  const refreshUser = async () => {
    await qc.invalidateQueries({ queryKey: authKeys.me });
  };

  // Login/register responses already contain the user — seed the cache instead
  // of triggering an extra /auth/me round trip.
  const login = async (data: LoginData) => {
    const loggedIn = await authApi.login(data);
    qc.setQueryData(authKeys.me, loggedIn);
  };

  const register = async (data: RegisterData) => {
    const registered = await authApi.register(data);
    qc.setQueryData(authKeys.me, registered);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      // Never keep another user's data in cache after sign-out.
      qc.setQueryData(authKeys.me, null);
      qc.clear();
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading: hasToken() ? isLoading : false, login, logout, register, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
