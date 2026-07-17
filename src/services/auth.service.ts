import { supabase } from "@/lib/supabase";
import type { user_role } from "@/types/global.types";
import type { Session } from "@supabase/supabase-js";

export type SignInResult = {
  data: { session: Session | null } | null;
  error: Error | null;
};

export type SignOutResult = { error: Error | null };
export type SessionResult = { session: Session | null; error: Error | null };

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<SignInResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { data: null, error };

  return { data: { session: data.session }, error: null };
}

export async function signOut(): Promise<SignOutResult> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession(): Promise<SessionResult> {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

export function onAuthStateChange(callback: (session: Session | null) => void) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return subscription;
}

export async function fetchUserRole(userId: string): Promise<user_role | ""> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return (data?.role as user_role) ?? "";
}
