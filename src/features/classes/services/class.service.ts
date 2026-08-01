import { supabase } from "@/lib/supabase";
import { ClassModel, CreateClassDTO } from "@/features/classes/class.types";

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

export async function updateClass(obClass: ClassModel): Promise<ClassModel> {
  if (!obClass.id) throw new Error("Class ID is required for update.");

  const { error } = await supabase.rpc("update_class_and_order", {
    p_class_id: obClass.id,
    p_name: obClass.name,
    p_type: obClass.type,
    p_new_order_index: obClass.order_index,
  });

  if (error) throw error;
  return obClass;
}
