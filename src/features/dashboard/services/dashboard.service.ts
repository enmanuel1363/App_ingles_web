import { supabase } from "@/lib/supabase";
import { DashboardStats, RecentActivity, TopStreak } from "../dashboard.types";

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    // Ejecutar todas las consultas en paralelo para evitar cascadas de red (waterfalls)
    const [studentsRes, classesRes, rewardsRes, scoresRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "student"),
      supabase
        .from("class")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("reward_student")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("exercise_student")
        .select("score")
    ]);

    if (studentsRes.error) throw studentsRes.error;
    if (classesRes.error) throw classesRes.error;
    if (rewardsRes.error) throw rewardsRes.error;
    if (scoresRes.error) throw scoresRes.error;

    const studentsCount = studentsRes.count || 0;
    const classesCount = classesRes.count || 0;
    const rewardsCount = rewardsRes.count || 0;
    const scoresData = scoresRes.data || [];

    let averageScore = 0;
    if (scoresData.length > 0) {
      const sum = scoresData.reduce((acc, curr) => acc + (curr.score || 0), 0);
      averageScore = parseFloat((sum / scoresData.length).toFixed(1));
    }

    return {
      activeStudents: studentsCount,
      totalClasses: classesCount,
      claimedRewards: rewardsCount,
      averageScore,
    };
  },

  async getRecentActivities(): Promise<RecentActivity[]> {
    const { data, error } = await supabase
      .from("exercise_student")
      .select(`
        id,
        score,
        is_complete,
        created_at,
        exercise:id_exercise(name, type),
        student:id_student_profile(full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      score: item.score || 0,
      isComplete: !!item.is_complete,
      createdAt: item.created_at,
      exerciseName: item.exercise?.name || "Ejercicio",
      exerciseType: item.exercise?.type || "speak",
      studentName: item.student?.full_name || "Estudiante",
    }));
  },

  async getTopStreaks(): Promise<TopStreak[]> {
    const { data, error } = await supabase
      .from("streak_student")
      .select(`
        id,
        current_streak,
        longest_streak,
        student:id_student_profile(full_name, avatar_url)
      `)
      .order("current_streak", { ascending: false })
      .limit(3);

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      currentStreak: item.current_streak || 0,
      longestStreak: item.longest_streak || 0,
      studentName: item.student?.full_name || "Estudiante",
      avatarUrl: item.student?.avatar_url || null,
    }));
  },
};
