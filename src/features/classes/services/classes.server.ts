import { createClient } from "@/lib/supabaseServer";
import { ClassModel } from "../class.types";

/**
 * Fetches classes of a unit on the server.
 */
export async function fetchClassesServer(unitId: string): Promise<ClassModel[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("class")
    .select("*")
    .order("order_index", { ascending: true })
    .eq("id_unit", unitId);

  if (error) {
    console.error("Error fetching classes on server:", error);
    throw error;
  }
  return data || [];
}

/**
 * Fetches unit name and order index on the server by its ID.
 */
export async function fetchUnitDetailsServer(unitId: string): Promise<{ name: string; order_index: number } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("unit")
    .select("name, order_index")
    .eq("id", unitId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching unit details on server:", error);
    return null;
  }
  return data;
}
