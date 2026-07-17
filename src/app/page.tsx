import { redirect } from "next/navigation";

// TODO: reactivar el login al final del proyecto.
// La versión original con formulario de email/contraseña quedó respaldada en page.auth-backup.tsx
export default function Index() {
  redirect("/dashboard");
}
