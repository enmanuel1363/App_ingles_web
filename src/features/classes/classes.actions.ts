"use server";

import { checkAdmin } from "@/lib/authServer";
import { z } from "zod";
import { ClassModel, CreateClassDTO } from "./class.types";

const classTypeSchema = z.enum(["mix", "write", "read", "speak"]);

const createClassSchema = z.object({
  id_unit: z.string().uuid("La unidad no es válida"),
  name: z
    .string()
    .min(1, "El nombre de la clase es requerido")
    .max(100, "El nombre es muy largo"),
  type: classTypeSchema,
  order_index: z.number().int("El índice de orden debe ser un número entero"),
});

const updateClassSchema = z.object({
  id: z.string().uuid("ID de clase no válido"),
  name: z
    .string()
    .min(1, "El nombre de la clase es requerido")
    .max(100, "El nombre es muy largo"),
  type: classTypeSchema,
  order_index: z.number().int("El índice de orden debe ser un número entero"),
});

export async function createClassAction(rawData: unknown) {
  try {
    const { supabase } = await checkAdmin();
    const validated = createClassSchema.parse(rawData);

    const { data, error } = await supabase
      .from("class")
      .insert(validated)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as ClassModel };
  } catch (error: any) {
    console.error("Error in createClassAction:", error);
    return {
      success: false,
      error: error.message || "Error al crear la clase",
    };
  }
}

export async function updateClassAction(rawData: unknown) {
  try {
    const { supabase } = await checkAdmin();
    const validated = updateClassSchema.parse(rawData);

    const { error } = await supabase.rpc("update_class_and_order", {
      p_class_id: validated.id,
      p_name: validated.name,
      p_type: validated.type,
      p_new_order_index: validated.order_index,
    });

    if (error) throw error;
    return { success: true, data: validated as ClassModel };
  } catch (error: any) {
    console.error("Error in updateClassAction:", error);
    return {
      success: false,
      error: error.message || "Error al actualizar la clase",
    };
  }
}

export async function deleteClassAction(classId: string, unitId: string) {
  try {
    const { supabase } = await checkAdmin();

    if (!classId || typeof classId !== "string") {
      throw new Error("ID de clase no válido");
    }
    if (!unitId || typeof unitId !== "string") {
      throw new Error("ID de unidad no válido");
    }

    const { error } = await supabase.rpc("delete_class", {
      class_id: classId,
      unit_id: unitId,
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteClassAction:", error);
    return {
      success: false,
      error: error.message || "Error al eliminar la clase",
    };
  }
}
