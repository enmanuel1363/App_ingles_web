import AdminNav from "@/components/navigation/AdminNav";
import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Validar sesión usando getUser (verificación criptográfica segura)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Consultar el rol del usuario en la base de datos de manera segura en el servidor
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  return <AdminNav>{children}</AdminNav>;
}
