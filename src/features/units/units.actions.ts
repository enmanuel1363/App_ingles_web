"use server";

import { checkAdmin } from "@/lib/authServer";
import { z } from "zod";
import { Unit } from "./unit.types";

const difficultySchema = z.enum(["low", "medium", "hard"]);

const createUnitSchema = z.object({
  id_course: z.string().uuid("El curso no es válido"),
  name: z.string().min(1, "El nombre de la unidad es requerido").max(100, "El nombre es muy largo"),
  order_index: z.number().int("El índice de orden debe ser un número entero"),
  difficulty: difficultySchema,
});

const updateUnitSchema = z.object({
  id_course: z.string().uuid("El curso no es válido").optional(),
  name: z.string().min(1, "El nombre de la unidad es requerido").max(100, "El nombre es muy largo").optional(),
  order_index: z.number().int("El índice de orden debe ser un número entero").optional(),
  difficulty: difficultySchema.optional(),
});

export async function createUnitAction(rawData: unknown) {
  try {
    const { supabase } = await checkAdmin();
    const validated = createUnitSchema.parse(rawData);
    
    const { data, error } = await supabase
      .from("unit")
      .insert(validated)
      .select()
      .single();
      
    if (error) throw error;
    return { success: true, data: data as Unit };
  } catch (error: any) {
    console.error("Error in createUnitAction:", error);
    return { success: false, error: error.message || "Error al crear la unidad" };
  }
}

export async function updateUnitAction(id: string, rawData: unknown) {
  try {
    const { supabase } = await checkAdmin();
    
    if (!id || typeof id !== "string") {
      throw new Error("ID de unidad no válido");
    }
    
    const validated = updateUnitSchema.parse(rawData);
    
    const { data, error } = await supabase
      .from("unit")
      .update(validated)
      .eq("id", id)
      .select()
      .single();
      
    if (error) throw error;
    return { success: true, data: data as Unit };
  } catch (error: any) {
    console.error("Error in updateUnitAction:", error);
    return { success: false, error: error.message || "Error al actualizar la unidad" };
  }
}

export async function deleteUnitAction(id: string) {
  try {
    const { supabase } = await checkAdmin();
    
    if (!id || typeof id !== "string") {
      throw new Error("ID de unidad no válido");
    }
    
    const { error } = await supabase
      .from("unit")
      .delete()
      .eq("id", id);
      
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteUnitAction:", error);
    return { success: false, error: error.message || "Error al eliminar la unidad" };
  }
}
