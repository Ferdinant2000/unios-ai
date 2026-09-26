"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  isLiveConfigured,
  logout as firebaseLogout,
  onAuthChanged,
  signInWithGoogle as googleSignIn,
  type AppUser,
} from "@/lib/firebase";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  isDemo: boolean;
  isProfessor: boolean;
  signInWithGoogle: () => Promise<AppUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(isLiveConfigured);

  useEffect(() => {
    if (!isLiveConfigured) {
      setLoading(false);
      return;
    }
    const off = onAuthChanged((next) => {
      setUser(next);
      setLoading(false);
    });
    return off;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const next = await googleSignIn();
    if (next) setUser(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    await firebaseLogout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isDemo: !isLiveConfigured,
      isProfessor: user?.role === "professor",
      signInWithGoogle,
      logout,
    }),
    [user, loading, signInWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}