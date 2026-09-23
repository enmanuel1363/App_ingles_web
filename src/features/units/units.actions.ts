"use server";

import { checkAdmin } from "@/lib/authServer";
import { z } from "zod";
import { Unit } from "./unit.types";

const difficultySchema = z.enum(["low", "medium", "hard"]);

const createUnitSchema = z.object({
  id_course: z.string().uuid("Invalid course"),
  name: z.string().min(1, "Unit name is required").max(100, "Name is too long"),
  order_index: z.number().int("Order index must be an integer"),
  difficulty: difficultySchema,
});

const updateUnitSchema = z.object({
  id_course: z.string().uuid("Invalid course").optional(),
  name: z.string().min(1, "Unit name is required").max(100, "Name is too long").optional(),
  order_index: z.number().int("Order index must be an integer").optional(),
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
    return { success: false, error: error.message || "Failed to create unit" };
  }
}

export async function updateUnitAction(id: string, rawData: unknown) {
  try {
    const { supabase } = await checkAdmin();
    
    if (!id || typeof id !== "string") {
      throw new Error("Invalid unit ID");
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
    return { success: false, error: error.message || "Failed to update unit" };
  }
}

export async function deleteUnitAction(id: string) {
  try {
    const { supabase } = await checkAdmin();
    
    if (!id || typeof id !== "string") {
      throw new Error("Invalid unit ID");
    }
    
    const { error } = await supabase
      .from("unit")
      .delete()
      .eq("id", id);
      
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteUnitAction:", error);
    return { success: false, error: error.message || "Failed to delete unit" };
  }
}
