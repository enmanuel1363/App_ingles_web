import AdminNav from "@/components/navigation/AdminNav";

// TODO: reactivar la protección de autenticación al final del proyecto.
// La versión original con validación de sesión/rol quedó respaldada en layout.auth-backup.tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminNav>{children}</AdminNav>;
}
