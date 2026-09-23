"use server";

import { checkAdmin } from "@/lib/authServer";
import { z } from "zod";
import { Course } from "./course.types";

const createCourseSchema = z.object({
  name: z.string().min(1, "Course name is required").max(100, "Name is too long"),
  id_grade: z.string().uuid("Invalid grade"),
  description: z.string().max(500, "Description is too long").nullable().optional(),
});

const updateCourseSchema = z.object({
  name: z.string().min(1, "Course name is required").max(100, "Name is too long").optional(),
  id_grade: z.string().uuid("Invalid grade").optional(),
  description: z.string().max(500, "Description is too long").nullable().optional(),
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
    return { success: false, error: error.message || "Failed to create course" };
  }
}

export async function updateCourseAction(id: string, rawData: unknown) {
  try {
    const { supabase } = await checkAdmin();
    
    if (!id || typeof id !== "string") {
      throw new Error("Invalid course ID");
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
    return { success: false, error: error.message || "Failed to update course" };
  }
}

export async function deleteCourseAction(id: string) {
  try {
    const { supabase } = await checkAdmin();
    
    if (!id || typeof id !== "string") {
      throw new Error("Invalid course ID");
    }
    
    const { error } = await supabase
      .from("course")
      .delete()
      .eq("id", id);
      
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteCourseAction:", error);
    return { success: false, error: error.message || "Failed to delete course" };
  }
}
