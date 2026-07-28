import { supabase } from "@/lib/supabase";
import { lesson_type } from "@/types/global.types";
import { CreateExerciseDTO, Exercise } from "@/features/exercises/exercise.types";

export async function getExercisesByClass(
  classId: string,
): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from("exercise")
    .select("*")
    .eq("id_class", classId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createExercises(
  exercises: (CreateExerciseDTO | Exercise)[],
): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from("exercise")
    .upsert(exercises)
    .select();

  if (error) throw error;
  return data;
}

export async function getAllExercisesByType(
  type: lesson_type,
): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from("exercise")
    .select("*")
    .eq("type", type)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deleteExercises(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase.from("exercise").delete().in("id", ids);
  if (error) throw error;
}
