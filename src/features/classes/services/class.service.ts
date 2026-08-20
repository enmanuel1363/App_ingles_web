import { supabase } from "@/lib/supabase";
import { ClassModel, CreateClassDTO } from "@/features/classes/class.types";
import { createClassAction, updateClassAction, deleteClassAction } from "../classes.actions";

export async function fetchClasses(id_unit: string): Promise<ClassModel[]> {
  const { data, error } = await supabase
    .from("class")
    .select("*")
    .order("order_index", { ascending: true })
    .eq("id_unit", id_unit);

  if (error) throw error;
  return data;
}

export async function createClass(
  newClass: CreateClassDTO,
): Promise<ClassModel> {
  const result = await createClassAction(newClass);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data!;
}

export async function deleteClass(classId: string, unitId: string) {
  const result = await deleteClassAction(classId, unitId);
  if (!result.success) {
    throw new Error(result.error);
  }
}

export async function updateClass(obClass: ClassModel): Promise<ClassModel> {
  if (!obClass.id) throw new Error("Class ID is required for update.");

  const result = await updateClassAction(obClass);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data!;
}

