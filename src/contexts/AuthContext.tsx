import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { LoginPayload, RegisterPayload, User } from "@/types";
import * as authApi from "@/services/api/auth";
import { setAccessToken, setOnAuthFailure, getAccessToken } from "@/services/api/axiosInstance";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchMeWithRetry(): Promise<User> {
  try {
    return await authApi.getMe();
  } catch {
    await wait(800);
    return await authApi.getMe();
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    setOnAuthFailure(() => {
      setAccessToken(null);
      setUser(null);
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await authApi.refreshToken();
        setAccessToken(token);
        const me = await authApi.getMe();
        setUser(me);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    })();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const token = await authApi.login(payload);
    setAccessToken(token);
    try {
      const me = await fetchMeWithRetry();
      setUser(me);
    } catch {
      setAccessToken(null);
      throw new Error("ورود با موفقیت انجام شد، اما دریافت اطلاعات حساب شما با خطا مواجه شد. لطفاً دوباره تلاش کنید.");
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await authApi.register(payload);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) return;
    const me = await authApi.getMe();
    setUser(me);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isInitializing,
        login,
        register,
        logout,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth باید داخل AuthProvider استفاده شود");
  return ctx;
}
