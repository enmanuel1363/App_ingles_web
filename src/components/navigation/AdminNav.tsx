"use client";

import { signOut } from "@/services/auth.service";
import useAuthStore from "@/store/useAuthStore";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./AdminNav.module.css";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/courses", label: "Clases" },
  { href: "/games", label: "Games" },
  { href: "/rewards", label: "Rewards" },
  { href: "/profile", label: "Perfil" },
];

export default function AdminNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { reset } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
    reset();
    router.replace("/");
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>App_ingles</div>
        <nav className={styles.navList}>
          {NAV_ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button className={styles.logout} onClick={handleLogout}>
          Cerrar sesión
        </button>
      </aside>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
