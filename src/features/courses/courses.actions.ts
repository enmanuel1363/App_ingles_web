"use server";

import { checkAdmin } from "@/lib/authServer";
import { z } from "zod";
import { Course } from "./course.types";

const createCourseSchema = z.object({
  name: z.string().min(1, "El nombre del curso es requerido").max(100, "El nombre es muy largo"),
  id_grade: z.string().uuid("El grado no es válido"),
  description: z.string().max(500, "La descripción es muy larga").nullable().optional(),
});

const updateCourseSchema = z.object({
  name: z.string().min(1, "El nombre del curso es requerido").max(100, "El nombre es muy largo").optional(),
  id_grade: z.string().uuid("El grado no es válido").optional(),
  description: z.string().max(500, "La descripción es muy larga").nullable().optional(),
});

export async function createCourseAction(rawData: unknown) {
  try {
    const { supabase } = await checkAdmin();
    const validated = createCourseSchema.parse(rawData);
    
    const { data, error } = await supabase
      .from("course")
      .insert(validated)
      .select()
      .single();
      
    if (error) throw error;
    return { success: true, data: data as Course };
  } catch (error: any) {
    console.error("Error in createCourseAction:", error);
    return { success: false, error: error.message || "Error al crear el curso" };
  }
}

export async function updateCourseAction(id: string, rawData: unknown) {
  try {
    const { supabase } = await checkAdmin();
    
    if (!id || typeof id !== "string") {
      throw new Error("ID de curso no válido");
    }
    
    const validated = updateCourseSchema.parse(rawData);
    
    const { data, error } = await supabase
      .from("course")
      .update(validated)
      .eq("id", id)
      .select()
      .single();
      
    if (error) throw error;
    return { success: true, data: data as Course };
  } catch (error: any) {
    console.error("Error in updateCourseAction:", error);
    return { success: false, error: error.message || "Error al actualizar el curso" };
  }
}

export async function deleteCourseAction(id: string) {
  try {
    const { supabase } = await checkAdmin();
    
    if (!id || typeof id !== "string") {
      throw new Error("ID de curso no válido");
    }
    
    const { error } = await supabase
      .from("course")
      .delete()
      .eq("id", id);
      
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteCourseAction:", error);
    return { success: false, error: error.message || "Error al eliminar el curso" };
  }
}
