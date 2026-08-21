import { createClient } from "@/lib/supabaseServer";
import { Unit } from "../unit.types";

/**
 * Fetches units of a course on the server.
 */
export async function fetchUnitsServer(courseId: string): Promise<Unit[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("unit")
    .select("*")
    .eq("id_course", courseId)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Error fetching units on server:", error);
    throw error;
  }
  return data as Unit[];
}

/**
 * Fetches a course title on the server by its ID.
 */
export async function fetchCourseTitleServer(courseId: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course")
    .select("name")
    .eq("id", courseId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching course title on server:", error);
    return "";
  }
  return data?.name || "";
}
