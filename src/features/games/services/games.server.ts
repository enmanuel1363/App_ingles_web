import { createClient } from "@/lib/supabaseServer";
import { Game } from "../games.types";

/**
 * Fetches all active games on the server.
 */
export async function getGamesServer(): Promise<Game[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching games on server:", error);
    return [];
  }

  return (data as Game[]) || [];
}
