import type { Metadata } from "next";
import AccountDeletionForm from "@/features/account-deletion/AccountDeletionForm";

export const metadata: Metadata = {
  title: "Solicitud de Eliminación de Cuenta y Datos — Zóe App",
  description:
    "Solicita la eliminación permanente de tu cuenta y todos los datos asociados en Zóe App.",
};

export default function AccountDeletionPage() {
  return (
    <div className="min-h-screen bg-[#fffcf2]">
      <div className="max-w-2xl mx-auto px-6 py-12 lg:py-16">
        <header className="mb-8 border-b border-slate-200 pb-8">
          <p className="text-cyan-650 font-semibold text-sm tracking-wide uppercase mb-2">
            Zóe App
          </p>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4">
            Solicitud de Eliminación de Cuenta y Datos
          </h1>
          <p className="text-slate-700 leading-relaxed">
            Usa este formulario para solicitar la eliminación permanente de tu
            cuenta y de toda la información asociada a tu perfil. Una vez
            enviada la solicitud, tu petición será procesada y en un plazo
            máximo de <strong>14 días hábiles</strong> se borrarán de manera
            definitiva todos tus datos de nuestros servidores.
          </p>
        </header>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 lg:p-8 mb-10">
          <AccountDeletionForm />
        </div>

        <section className="space-y-4 text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">
            ¿Qué información se eliminará de forma permanente?
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Información de perfil:</strong> correo electrónico
              vinculado, nombre de usuario e ID único de usuario.
            </li>
            <li>
              <strong>Datos de Google:</strong> vínculo de inicio de sesión
              con Google Sign-In, tokens de autenticación y credenciales
              asociadas.
            </li>
            <li>
              <strong>Personalizaciones del perfil:</strong> ajustes de
              interfaz, temas y configuraciones personalizadas de tu cuenta.
            </li>
            <li>
              <strong>Estadísticas de progreso:</strong> historial de
              lecciones/ejercicios, métricas de rendimiento, niveles
              alcanzados y logros acumulados.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 pt-4">
            Plazo de procesamiento
          </h2>
          <p>
            Una vez enviada la solicitud, el proceso de eliminación
            definitiva en nuestras bases de datos y servidores tomará un
            plazo máximo de 14 días hábiles. Al finalizar, recibirás un
            correo de confirmación y tus datos serán purgados de forma
            irreversible.
          </p>
        </section>

        <footer className="border-t border-slate-200 pt-6 mt-12 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Zóe App. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  );
}
