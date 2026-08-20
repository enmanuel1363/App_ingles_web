import { createClient } from "./supabaseServer";
import { user_role } from "@/types/global.types";

/**
 * Verifies that the user is authenticated and has the 'admin' role.
 * Returns the supabase client instance and the authenticated user object.
 */
export async function checkAdmin() {
  const supabase = await createClient();
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("No autenticado. Inicie sesión para continuar.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || (profile.role as user_role) !== "admin") {
    throw new Error("No autorizado. Se requiere rol de administrador.");
  }

  return { supabase, user };
}
