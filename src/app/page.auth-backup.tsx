"use client";

import { useAuth } from "@/features/login/hooks/useAuth";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { session, userRole, loading, authLoading, handleLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (session && userRole === "admin") {
      setUser("admin");
      router.replace("/dashboard");
    }
  }, [session, userRole, setUser, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const error = await handleLogin(email, password);
    if (error) setFormError(error);
  };

  if (loading) {
    return <div className={styles.container}>Cargando…</div>;
  }

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={onSubmit}>
        <h1 className={styles.title}>App_ingles</h1>
        <p className={styles.subtitle}>
          Panel de administración — inicia sesión para continuar
        </p>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            Correo
          </label>
          <input
            id="email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {formError && <p className={styles.error}>{formError}</p>}

        <button type="submit" className={styles.submit} disabled={authLoading}>
          {authLoading ? "Ingresando…" : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
}
