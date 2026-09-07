"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  ensureAuth,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut,
  mapAuthError,
} from "@/lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (next) => {
      setUser(next);
      setLoading(false);
    });
    return unsub;
  }, []);

  const isFullAccount = Boolean(user && !user.isAnonymous);

  const value = useMemo(
    () => ({
      user,
      loading,
      isFullAccount,
      ensureAuth,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      mapAuthError,
    }),
    [user, loading, isFullAccount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
