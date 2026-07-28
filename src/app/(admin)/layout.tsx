"use client";

import AdminNav from "@/components/navigation/AdminNav";
import { useAuth } from "@/features/login/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { session, userRole, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!session || userRole !== "admin")) {
      router.replace("/");
    }
  }, [loading, session, userRole, router]);

  if (loading || !session || userRole !== "admin") {
    return (
      <div className="min-h-screen bg-[#fffcf2] flex flex-col items-center justify-center text-slate-500 space-y-4 animate-fade-in">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-605" />
        <span className="text-sm font-semibold">Verificando credenciales de administrador...</span>
      </div>
    );
  }

  return <AdminNav>{children}</AdminNav>;
}
