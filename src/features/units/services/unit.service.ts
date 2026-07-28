import { supabase } from "@/lib/supabase";
import { Unit } from "@/features/units/unit.types";

export async function fetchUnits(courseId: string) {
  const { data, error } = await supabase
    .from("unit")
    .select("*")
    .eq("id_course", courseId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data as Unit[];
}

export async function createUnit(
  unit: Omit<Unit, "id" | "created_at" | "updated_at">,
) {
  const { data, error } = await supabase
    .from("unit")
    .insert(unit)
    .select()
    .single();

  if (error) throw error;
  return data as Unit;
}
