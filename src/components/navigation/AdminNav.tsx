"use client";

import { signOut } from "@/features/login/services/auth.service";
import { useAuth } from "@/features/login/hooks/useAuth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Gamepad2,
  Award,
  User,
  LogOut,
  Target,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/courses", label: "Courses", Icon: BookOpen },
  { href: "/games", label: "Games", Icon: Gamepad2 },
  { href: "/rewards", label: "Rewards", Icon: Award },
  { href: "/goals", label: "Goals", Icon: Target },
];

export default function AdminNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useAuth();

  const userMetadata = session?.user?.user_metadata;
  const currentUser = session?.user
    ? {
        name: userMetadata?.full_name || userMetadata?.name || "Usuario",
        email: session.user.email || "",
        avatarUrl: userMetadata?.avatar_url || undefined,
      }
    : null;

  const handleLogout = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#fffcf2] text-slate-900 font-sans">
      {/* Sidebar navigation */}
      <aside className="w-64 h-full flex-shrink-0 bg-white border-r border-slate-200/80 flex flex-col justify-between p-6 overflow-y-auto">
        <div>
          {/* Brand header */}
          <div className="flex items-center space-x-3 mb-8 px-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-lime-300 flex items-center justify-center font-bold text-slate-950 shadow-sm shadow-cyan-500/10">
              E
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent tracking-tight">
              My English app
            </span>
          </div>

          {/* Navigation link list */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname?.startsWith(item.href);
              const Icon = item.Icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    active
                      ? "bg-cyan-500/10 text-cyan-700 border-l-2 border-cyan-505"
                      : "text-slate-655 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      active
                        ? "text-cyan-600"
                        : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action / footer area */}
        <div className="border-t border-slate-100 pt-4 space-y-4">
          {currentUser && (
            <div className="flex items-center space-x-3 px-2 py-1">
              {currentUser.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full border border-slate-205 object-cover shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 flex items-center justify-center font-bold text-xs shrink-0 capitalize">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[9px] font-bold text-slate-450 truncate mt-0.5">
                  {currentUser.email}
                </p>
              </div>
            </div>
          )}

          <button
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-500/5 transition-all duration-200 cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content display area */}
      <main className="flex-1 h-full bg-[#fffcf2] overflow-y-auto p-8 lg:p-12">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
