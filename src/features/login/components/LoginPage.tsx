"use client";

import { useAuth } from "@/features/login/hooks/useAuth";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Lock, ShieldCheck, LogIn } from "lucide-react";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { session, userRole, loading, authLoading, handleGoogleLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session && userRole === "admin") {
      setUser("admin");
      router.replace("/dashboard");
    } else if (session && userRole !== "" && userRole !== "admin") {
      setError("Tu cuenta no tiene permisos de administrador.");
    }
  }, [session, userRole, setUser, router]);

  const onGoogleLogin = async () => {
    setError(null);
    const err = await handleGoogleLogin();
    if (err) setError(err);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffcf2] flex flex-col items-center justify-center text-slate-500 space-y-4 animate-fade-in">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-605" />
        <span className="text-sm font-semibold">Verificando sesión...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffcf2] text-slate-800 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-lime-500/10 blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md bg-white border border-slate-200/80 rounded-3xl shadow-xl p-8 md:p-10 space-y-8 text-center animate-scale-up">
        {/* Brand/Logo header */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-lime-300 flex items-center justify-center font-extrabold text-2xl text-slate-950 shadow-md shadow-cyan-500/10 relative group">
            E
            <div className="absolute -top-1.5 -right-1.5 bg-cyan-600 text-white rounded-full p-1 border border-white shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent tracking-tight">
            My English app Admin
          </h1>
          <p className="text-slate-500 text-sm font-semibold">
            Inicia sesión para acceder al panel de administración
          </p>
        </div>

        {/* Action area */}
        <div className="space-y-4">
          <Button
            variant="outlined"
            onClick={onGoogleLogin}
            disabled={authLoading}
            isLoading={authLoading}
            leftIcon={!authLoading && <LogIn className="w-5 h-5 shrink-0" />}
            className="w-full py-3.5 border-slate-200 hover:border-slate-350 bg-white"
          >
            Iniciar sesión con Google
          </Button>

          {/* Error alert */}
          {error && (
            <div className="flex items-start space-x-2.5 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-left">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="text-xs font-bold leading-normal">{error}</span>
            </div>
          )}
        </div>

        {/* Disclaimer / footer */}
        <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-400 font-semibold border-t border-slate-100 pt-4">
          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Acceso exclusivo para administradores autorizados.</span>
        </div>
      </div>
    </div>
  );
}
