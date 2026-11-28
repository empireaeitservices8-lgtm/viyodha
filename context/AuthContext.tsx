"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, User, CartItem } from "@/lib/api";

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  cartCount: number;
  login: (email: string, password: string) => Promise<User>;
  register: (details: { username: string; email: string; password: string; phone: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  refreshCartCount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getDistinctCartCount(items: CartItem[] | null | undefined): number {
  if (!items || !Array.isArray(items) || items.length === 0) return 0;
  return new Set(items.map((item) => item.product_id || item.name)).size;
}

function setAuthCookies(token: string, role: string) {
  if (typeof document !== "undefined") {
    document.cookie = `viyodha_token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `viyodha_role=${encodeURIComponent(role)}; path=/; max-age=604800; SameSite=Lax`;
  }
}

function clearAuthCookies() {
  if (typeof document !== "undefined") {
    document.cookie = "viyodha_token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "viyodha_role=; path=/; max-age=0; SameSite=Lax";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = useCallback(async () => {
    const savedToken = token || (typeof window !== "undefined" ? localStorage.getItem("viyodha_token") : null);
    if (!savedToken) {
      setCartCount(0);
      return;
    }
    try {
      const items = await api.getCart(savedToken);
      setCartCount(getDistinctCartCount(items));
    } catch {
      setCartCount(0);
    }
  }, [token]);

  const refreshProfile = useCallback(async () => {
    const savedToken = token || (typeof window !== "undefined" ? localStorage.getItem("viyodha_token") : null);
    if (!savedToken) {
      clearAuthCookies();
      setUser(null);
      setCartCount(0);
      return;
    }
    try {
      const profile = await api.getProfile(savedToken);
      setUser(profile);
      setAuthCookies(savedToken, profile.role);
      await refreshCartCount();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message.toLowerCase() : "";
      const isAuthError =
        errorMsg.includes("invalid") ||
        errorMsg.includes("expired") ||
        errorMsg.includes("unauthorized") ||
        errorMsg.includes("token");

      if (isAuthError) {
        localStorage.removeItem("viyodha_token");
        clearAuthCookies();
        setUser(null);
        setToken(null);
        setCartCount(0);
      }
    }
  }, [token, refreshCartCount]);

  useEffect(() => {
    const savedToken = localStorage.getItem("viyodha_token");
    if (savedToken) {
      setToken(savedToken);
      api
        .getProfile(savedToken)
        .then((profile) => {
          setUser(profile);
          setAuthCookies(savedToken, profile.role);
          return api.getCart(savedToken);
        })
        .then((items) => {
          setCartCount(getDistinctCartCount(items));
        })
        .catch((err: unknown) => {
          const errorMsg = err instanceof Error ? err.message.toLowerCase() : "";
          const isAuthError =
            errorMsg.includes("invalid") ||
            errorMsg.includes("expired") ||
            errorMsg.includes("unauthorized") ||
            errorMsg.includes("token");

          if (isAuthError) {
            localStorage.removeItem("viyodha_token");
            clearAuthCookies();
            setUser(null);
            setToken(null);
            setCartCount(0);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      clearAuthCookies();
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login({ email, password });
    localStorage.setItem("viyodha_token", data.token);
    setAuthCookies(data.token, data.user.role);
    setToken(data.token);
    setUser(data.user);
    try {
      const items = await api.getCart(data.token);
      setCartCount(getDistinctCartCount(items));
    } catch {
      setCartCount(0);
    }
    return data.user as User;
  };

  const register = async (details: { username: string; email: string; password: string; phone: string }) => {
    const data = await api.register(details);
    if (data.token) {
      localStorage.setItem("viyodha_token", data.token);
      setAuthCookies(data.token, data.user.role);
      setToken(data.token);
      setUser(data.user);
    }
  };

  const logout = () => {
    localStorage.removeItem("viyodha_token");
    clearAuthCookies();
    setUser(null);
    setToken(null);
    setCartCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        cartCount,
        login,
        register,
        logout,
        refreshProfile,
        refreshCartCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
