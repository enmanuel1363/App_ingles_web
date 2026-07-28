import { supabase } from "@/lib/supabase";
import { CreateGoalDTO, Goal, GoalWithReward, Reward } from "../goals.types";

export const goalsService = {
  async getGoals(): Promise<GoalWithReward[]> {
    // Obtenemos los objetivos, cursos y clases en paralelo
    const [goalsResult, coursesResult, classesResult] = await Promise.all([
      supabase
        .from("goals")
        .select("*, reward(*)")
        .order("created_at", { ascending: false }),
      supabase.from("course").select("id, name"),
      supabase.from("class").select("id, name"),
    ]);

    if (goalsResult.error) throw goalsResult.error;
    if (coursesResult.error) throw coursesResult.error;
    if (classesResult.error) throw classesResult.error;

    const courses = coursesResult.data || [];
    const classes = classesResult.data || [];

    return (goalsResult.data || []).map((goal: any) => {
      // Tomamos la primera recompensa si nos devuelve un array
      const reward = Array.isArray(goal.reward) 
        ? goal.reward[0] 
        : (goal.reward || null);

      let targetLabel = "";
      if (goal.validation && typeof goal.validation === "object") {
        const val = goal.validation as any;
        if (goal.type === "lesson") {
          const lessonId = val.lesson;
          const matchedClass = classes.find((c) => c.id === lessonId);
          targetLabel = matchedClass ? matchedClass.name : (lessonId || "Desconocida");
        } else if (goal.type === "classes") {
          const courseId = val.classes;
          const matchedCourse = courses.find((c) => c.id === courseId);
          targetLabel = matchedCourse ? matchedCourse.name : (courseId || "Desconocido");
        }
      }

      return {
        ...goal,
        reward,
        targetLabel,
      };
    });
  },

  async getAvailableRewards(currentGoalId?: string): Promise<Reward[]> {
    // Obtenemos las recompensas que no tienen un objetivo asociado,
    // o que ya están asociadas al objetivo actual si estamos editando.
    let query = supabase.from("reward").select("*");
    
    if (currentGoalId) {
      query = query.or(`id_goal.is.null,id_goal.eq.${currentGoalId}`);
    } else {
      query = query.is("id_goal", null);
    }

    const { data, error } = await query.order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createGoal(
    goal: CreateGoalDTO,
    rewardId?: string
  ): Promise<Goal> {
    const { data, error } = await supabase
      .from("goals")
      .insert(goal)
      .select()
      .single();

    if (error) throw error;

    if (rewardId) {
      const { error: rewardError } = await supabase
        .from("reward")
        .update({ id_goal: data.id })
        .eq("id", rewardId);
      
      if (rewardError) throw rewardError;
    }

    return data;
  },

  async updateGoal(
    id: string,
    goal: Partial<CreateGoalDTO>,
    rewardId?: string
  ): Promise<Goal> {
    const { data, error } = await supabase
      .from("goals")
      .update(goal)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Manejo de la asociación de recompensas
    // 1. Primero desasociamos las recompensas anteriores que apuntaban a este goal
    const { error: unlinkError } = await supabase
      .from("reward")
      .update({ id_goal: null })
      .eq("id_goal", id);

    if (unlinkError) throw unlinkError;

    // 2. Si se especificó una nueva recompensa, la asociamos
    if (rewardId) {
      const { error: linkError } = await supabase
        .from("reward")
        .update({ id_goal: id })
        .eq("id", rewardId);

      if (linkError) throw linkError;
    }

    return data;
  },

  async deleteGoal(id: string): Promise<void> {
    // Desasociar recompensas primero para evitar conflictos de claves foráneas
    const { error: unlinkError } = await supabase
      .from("reward")
      .update({ id_goal: null })
      .eq("id_goal", id);

    if (unlinkError) throw unlinkError;

    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async getCourses(): Promise<{ id: string; name: string }[]> {
    const { data, error } = await supabase
      .from("course")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getClasses(): Promise<{ id: string; name: string }[]> {
    const { data, error } = await supabase
      .from("class")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  }
};
