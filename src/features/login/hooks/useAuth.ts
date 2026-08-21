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
import React, { useCallback, useEffect, useState, createContext, useContext } from "react";

type AuthContextType = {
  session: Session | null;
  userRole: user_role | "";
  loading: boolean;
  authLoading: boolean;
  handleLogin: (email: string, password: string) => Promise<string | null>;
  handleGoogleLogin: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<user_role | "">("");
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    let active = true;

    // Obtener la sesión inicial de forma única
    getSession().then(async ({ session: initialSession }) => {
      if (!active) return;
      setSession(initialSession);
      if (initialSession?.user) {
        const role = await fetchUserRole(initialSession.user.id);
        if (active) {
          setUserRole(role);
        }
      } else {
        if (active) {
          setUserRole("");
        }
      }
      if (active) setLoading(false);
    });

    // Suscribirse a cambios de estado de autenticación de forma única
    const sub = onAuthStateChange(async (nextSession) => {
      if (!active) return;
      
      // Evitar race condition de sesiones temporales vacías durante refresco
      if (nextSession === null) {
        setSession(null);
        setUserRole("");
        return;
      }

      setSession(nextSession);
      if (nextSession.user) {
        const role = await fetchUserRole(nextSession.user.id);
        if (active) {
          setUserRole(role);
        }
      }
    });

    return () => {
      active = false;
      sub.unsubscribe();
    };
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
          setUserRole("admin");
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

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        session,
        userRole,
        loading,
        authLoading,
        handleLogin: handlePasswordLogin,
        handleGoogleLogin,
      },
    },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
