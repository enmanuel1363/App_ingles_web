"use client";

import {
  fetchUserRole,
  getSession,
  onAuthStateChange,
  signInWithGoogle,
  signInWithPassword,
} from "@/features/login/services/auth.service";
import type { user_role } from "@/types/global.types";
import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<user_role | "">("");
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    getSession().then(async ({ session }) => {
      setSession(session);
      if (session?.user) {
        const role = await fetchUserRole(session.user.id);
        setUserRole(role);
      }
      setLoading(false);
    });

    const sub = onAuthStateChange(async (nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        const role = await fetchUserRole(nextSession.user.id);
        setUserRole(role);
      } else {
        setUserRole("");
      }
    });

    return () => sub.unsubscribe();
  }, []);

  const handlePasswordLogin = useCallback(
    async (email: string, password: string) => {
      setAuthLoading(true);
      try {
        const { data, error } = await signInWithPassword(email, password);
        if (error) return error.message;

        const user = data?.session?.user;
        if (user) {
          const role = await fetchUserRole(user.id);
          if (role !== "admin") {
            return "Esta cuenta no tiene acceso de administrador";
          }
        }
        return null;
      } catch (e: any) {
        return e?.message ?? "Error al iniciar sesión";
      } finally {
        setAuthLoading(false);
      }
    },
    [],
  );

  const handleGoogleLogin = useCallback(async () => {
    setAuthLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) return error.message;
      return null;
    } catch (e: any) {
      return e?.message ?? "Error al conectar con Google";
    } finally {
      setAuthLoading(false);
    }
  }, []);

  return {
    session,
    userRole,
    loading,
    authLoading,
    handleLogin: handlePasswordLogin,
    handleGoogleLogin,
  };
}
