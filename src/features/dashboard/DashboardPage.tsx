"use client";

import React from "react";
import {
  Users,
  GraduationCap,
  Trophy,
  BarChart3,
  ArrowUpRight,
  Play,
  BookOpen,
  Clock,
  Flame,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Gamepad2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useDashboard } from "./hooks/useDashboard";

// Función helper para formatear tiempo relativo en español
function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // Si la fecha es en el futuro o el reloj está ligeramente desalineado
    if (diffMs < 0) return "Hace un momento";

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Hace un momento";
    if (diffMins < 60) return `Hace ${diffMins} min${diffMins > 1 ? "s" : ""}`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Ayer";
    return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
  } catch (e) {
    return "Recientemente";
  }
}

// Formatear tipo de lección para hacerlo más amigable al usuario
function formatLessonType(type: string): string {
  const types: Record<string, string> = {
    speak: "Hablar/Pronunciación",
    write_word: "Escribir palabra",
    image_gallery: "Galería de imágenes",
    reading_quiz: "Lectura/Quiz",
    video_session: "Sesión de video",
    type_answer: "Escribir respuesta",
    complete_word: "Completar palabra",
    say_word: "Decir palabra",
    audio_session: "Comprensión auditiva",
    match_names: "Emparejar nombres",
    overview_session: "Repaso general",
  };
  return types[type] || type;
}

export default function DashboardPage() {
  const router = useRouter();
  const {
    stats,
    recentActivities,
    topStreaks,
    isLoading,
    error,
    refreshDashboard,
  } = useDashboard();

  // Mapeo dinámico para las tarjetas de estadísticas reales
  const statsConfig = [
    {
      label: "Estudiantes Activos",
      value: stats.activeStudents.toString(),
      subtitle: "Alumnos registrados",
      Icon: Users,
      color: "text-cyan-600 bg-cyan-50 border-cyan-100",
    },
    {
      label: "Lecciones Creadas",
      value: stats.totalClasses.toString(),
      subtitle: "Clases en la plataforma",
      Icon: GraduationCap,
      color: "text-lime-600 bg-lime-50 border-lime-100",
    },
    {
      label: "Recompensas Reclamadas",
      value: stats.claimedRewards.toString(),
      subtitle: "Medallas desbloqueadas",
      Icon: Trophy,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      label: "Rendimiento Promedio",
      value: `${stats.averageScore} pts`,
      subtitle: "Puntaje promedio global",
      Icon: BarChart3,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
  ];

  const shortcuts = [
    {
      title: "Crear Nueva Lección",
      desc: "Añade contenido interactivo",
      route: "/courses",
      Icon: BookOpen,
    },
    {
      title: "Configurar Recompensas",
      desc: "Medallas, premios y logros",
      route: "/rewards",
      Icon: Trophy,
    },
    {
      title: "Ver Mini Juegos",
      desc: "Monitorea mecánicas lúdicas",
      route: "/games",
      Icon: Gamepad2,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-cyan-400/20 via-cyan-400/5 to-white border border-cyan-400/25 p-8 md:p-10 shadow-lg shadow-cyan-400/5">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-700 border border-cyan-500/20">
              Panel del Profesor
            </span>
            <Button
              variant="outlined"
              onClick={refreshDashboard}
              disabled={isLoading}
              className="py-1 px-2.5 rounded-full text-xs font-bold border-slate-200 bg-white"
            >
              <div className="flex flex-row items-center gap-2">
                <RefreshCw
                  className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
                />
                Sincronizar
              </div>
            </Button>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            ¡Welcome back, Teacher! 👋
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium">
            Administra tus clases, diseña juegos interactivos y recompensa el
            progreso de tus estudiantes en tiempo real.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Button
              variant="primary"
              leftIcon={<Play className="w-4 h-4 fill-current" />}
              onClick={() => router.push("/courses")}
            >
              Ver mis clases
            </Button>
            <Button variant="outlined" onClick={() => router.push("/games")}>
              Crear Juego Rápido
            </Button>
          </div>
        </div>

        {/* Ambient light glow behind */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-72 h-72 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-20 w-80 h-80 rounded-full bg-lime-400/5 blur-3xl pointer-events-none" />
      </section>

      {/* Error state alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl p-5 flex items-start space-x-3.5 shadow-sm">
          <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-900">
              Error al sincronizar dashboard
            </h4>
            <p className="text-sm text-rose-700/90 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Grid statistics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, idx) => {
          const Icon = stat.Icon;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-300 group relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div
                  className={`p-3 rounded-xl ${stat.color} transition-all duration-300 border`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <button
                  onClick={() => router.push("/courses")}
                  className="text-[10px] font-bold text-cyan-600 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20 flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer focus:outline-none"
                >
                  <span>Detalle</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                  {stat.label}
                </p>
                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {isLoading ? (
                    <span className="inline-block w-16 h-8 bg-slate-100 rounded animate-pulse" />
                  ) : (
                    stat.value
                  )}
                </h3>
              </div>
              <p className="text-slate-400 text-[10px] mt-3 flex items-center font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                {stat.subtitle}
              </p>
            </div>
          );
        })}
      </section>

      {/* Main double column dashboard panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 cols: Recent activities */}
        <section className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Actividad Reciente
              </h2>
              <p className="text-slate-500 text-sm font-medium">
                Progreso en tiempo real de tus estudiantes en lecciones
              </p>
            </div>
            <button
              onClick={() => router.push("/courses")}
              className="text-cyan-600 hover:text-cyan-700 text-sm font-bold transition-colors duration-200 cursor-pointer focus:outline-none"
            >
              Ver clases
            </button>
          </div>

          <div className="divide-y divide-slate-100 space-y-4 min-h-[250px] flex flex-col justify-center">
            {isLoading ? (
              // Loader skeletons
              Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center pt-4 first:pt-0 animate-pulse"
                >
                  <div className="flex items-center space-x-3.5 w-2/3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100" />
                    <div className="space-y-1.5 grow">
                      <div className="h-4 bg-slate-100 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="w-16 h-6 bg-slate-100 rounded-full" />
                </div>
              ))
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-400 border border-slate-100">
                  <BookOpen className="w-6 h-6 stroke-[1.5]" />
                </div>
                <p className="text-sm font-bold text-slate-400">
                  Sin actividad registrada en los ejercicios aún.
                </p>
              </div>
            ) : (
              recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 first:pt-0 group"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="mt-1 p-2 rounded-lg bg-slate-50 text-slate-650 border border-slate-100 group-hover:bg-slate-100 transition-colors">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-slate-900 transition-colors text-sm sm:text-base">
                        <span className="text-primary-dark font-extrabold">
                          {act.studentName}
                        </span>{" "}
                        completó{" "}
                        <span className="font-semibold text-slate-750">
                          {act.exerciseName}
                        </span>
                      </h4>
                      <div className="flex items-center space-x-2.5 mt-1 text-xs text-slate-500 font-semibold">
                        <span>{formatLessonType(act.exerciseType)}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {formatRelativeTime(act.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center space-x-3 self-end sm:self-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        act.isComplete
                          ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                      }`}
                    >
                      {act.isComplete ? "Completado" : "En curso"}
                    </span>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60 shadow-sm">
                      {act.score}/10
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right 1 col: Streaks and quick actions */}
        <section className="space-y-6">
          {/* Top Streaks Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <Flame className="w-5 h-5 text-orange-500 fill-current animate-pulse" />
                Mejores Rachas
              </h2>
              <p className="text-slate-500 text-sm font-medium">
                Estudiantes más constantes del aula
              </p>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center animate-pulse"
                  >
                    <div className="flex items-center space-x-3 w-3/4">
                      <div className="w-8 h-8 rounded-full bg-slate-100" />
                      <div className="h-4 bg-slate-100 rounded w-1/2" />
                    </div>
                    <div className="w-12 h-6 bg-slate-100 rounded-lg" />
                  </div>
                ))
              ) : topStreaks.length === 0 ? (
                <div className="text-center py-4 text-xs font-bold text-slate-400 italic">
                  Aún no hay rachas acumuladas.
                </div>
              ) : (
                topStreaks.map((streak, index) => (
                  <div
                    key={streak.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      {/* Avatar Circle */}
                      {streak.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={streak.avatarUrl}
                          alt={streak.studentName}
                          className="w-8.5 h-8.5 rounded-full object-cover border border-slate-100"
                        />
                      ) : (
                        <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {streak.studentName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {streak.studentName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          Puesto #{index + 1}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 bg-orange-50 border border-orange-100 text-orange-700 px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm shrink-0">
                      <Flame className="w-4 h-4 fill-current" />
                      <span>{streak.currentStreak} días</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Shortcuts list */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Accesos Rápidos
              </h2>
              <p className="text-slate-500 text-sm font-medium">
                Accesos rápidos para tu flujo diario
              </p>
            </div>

            <div className="space-y-3">
              {shortcuts.map((shortcut, idx) => {
                const Icon = shortcut.Icon;
                return (
                  <button
                    key={idx}
                    onClick={() => router.push(shortcut.route)}
                    className="w-full text-left block p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-350 transition-all duration-200 group shadow-sm cursor-pointer focus:outline-none"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-white border border-slate-100 text-slate-450 group-hover:text-primary-dark group-hover:bg-primary/5 transition-all duration-250">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 group-hover:text-slate-900 transition-colors text-sm">
                            {shortcut.title}
                          </h4>
                          <p className="text-slate-500 text-xs mt-1 font-semibold">
                            {shortcut.desc}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 transition-colors shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Stats banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-650 border border-indigo-55 shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-indigo-750 font-bold uppercase tracking-wider leading-none">
                  Métricas de Aula
                </p>
                <h5 className="font-extrabold text-indigo-900 text-xs mt-1 leading-snug">
                  Monitoreando {stats.activeStudents} estudiantes activos
                </h5>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
