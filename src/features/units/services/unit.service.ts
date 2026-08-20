import { supabase } from "@/lib/supabase";
import { Unit } from "@/features/units/unit.types";
import { createUnitAction, updateUnitAction, deleteUnitAction } from "../units.actions";

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
  const result = await createUnitAction(unit);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data!;
}

export async function updateUnit(
  id: string,
  unit: Partial<Omit<Unit, "id" | "created_at" | "updated_at">>,
) {
  const result = await updateUnitAction(id, unit);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data!;
}

export async function deleteUnit(id: string) {
  const result = await deleteUnitAction(id);
  if (!result.success) {
    throw new Error(result.error);
  }
}

