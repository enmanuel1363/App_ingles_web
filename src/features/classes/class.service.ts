import { supabase } from "@/lib/supabase";
import { ClassModel, CreateClassDTO } from "./class.types";

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
  const { data, error } = await supabase
    .from("class")
    .insert([newClass])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteClass(classId: string, unitId: string) {
  const { error } = await supabase.rpc("delete_class", {
    class_id: classId,
    unit_id: unitId,
  });

  if (error) throw error;
}

export async function updateClass(obClass: ClassModel) {
  const { data, error } = await supabase
    .from("class")
    .upsert(obClass)
    .select()
    .single();

  if (error) throw error;
  return data;
}
