"use client";

import AdminNav from "@/components/navigation/AdminNav";
import { useAuth } from "@/features/login/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "@/components/navigation/AdminNav.module.css";

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
    return <div className={styles.centered}>Cargando…</div>;
  }

  return <AdminNav>{children}</AdminNav>;
}
