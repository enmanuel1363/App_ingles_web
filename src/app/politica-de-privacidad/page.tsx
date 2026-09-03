import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad — Zóe App",
  description:
    "Política de privacidad de Zóe App: qué datos recopilamos, cómo los usamos y quién puede acceder a ellos.",
};

const LAST_UPDATED = "1 de septiembre de 2026";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-10 scroll-mt-24">
      <h2 className="text-xl font-bold text-slate-900 mb-3">{title}</h2>
      <div className="space-y-3 text-slate-700 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#fffcf2]">
      <div className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
        <header className="mb-10 border-b border-slate-200 pb-8">
          <p className="text-cyan-650 font-semibold text-sm tracking-wide uppercase mb-2">
            Zóe App
          </p>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">
            Política de Privacidad
          </h1>
          <p className="text-sm text-slate-500">
            Última actualización: {LAST_UPDATED}
          </p>
        </header>

        <Section id="introduccion" title="1. Introducción">
          <p>
            Esta Política de Privacidad describe cómo <strong>Zóe App</strong>{" "}
            (en adelante, &quot;la Aplicación&quot;, &quot;nosotros&quot; o
            &quot;la Plataforma&quot;) recopila, utiliza, almacena y protege la
            información de las personas que la utilizan, ya sea a través de la
            aplicación móvil (disponible para estudiantes) o del panel web de
            administración (utilizado por docentes y personal administrativo).
          </p>
          <p>
            Zóe App es una plataforma educativa diseñada para la enseñanza del
            idioma inglés a estudiantes de nivel secundario. Al utilizar la
            Aplicación, usted acepta las prácticas descritas en este documento.
            Si es usted un estudiante menor de edad, el uso de la Aplicación
            debe estar autorizado y supervisado por su institución educativa,
            docente o madre, padre o tutor legal, según corresponda.
          </p>
        </Section>

        <Section id="roles" title="2. Roles dentro de la aplicación">
          <p>
            Zóe App distingue entre dos tipos de perfiles, cada uno con
            distintos niveles de acceso a la información:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Administrador / Docente:</strong> utiliza el panel web
              para crear cursos, unidades, clases, ejercicios, recompensas y
              juegos. Tiene acceso a la información académica de los
              estudiantes de las clases que administra (progreso, resultados
              de ejercicios, rachas de estudio), pero no tiene acceso a
              contraseñas ni a datos financieros de nadie.
            </li>
            <li>
              <strong>Estudiante / Usuario:</strong> utiliza la aplicación
              móvil para completar lecciones, ejercicios y juegos. Su acceso
              se limita a su propio progreso, sus propias recompensas
              obtenidas y el contenido educativo publicado por su
              administrador o docente.
            </li>
          </ul>
          <p>
            Ningún estudiante puede ver información personal, de progreso o de
            desempeño de otros estudiantes. Los administradores solo pueden
            ver la información académica de los estudiantes inscritos en los
            cursos o clases bajo su gestión, nunca datos de cuentas ajenas a
            su institución.
          </p>
        </Section>

        <Section id="datos-recopilados" title="3. Información que recopilamos">
          <p>
            <strong>3.1 Información de la cuenta (todos los usuarios)</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Nombre y apellido</li>
            <li>Correo electrónico</li>
            <li>Fotografía de perfil (opcional, si el usuario la sube)</li>
            <li>
              Edad (recopilada únicamente con fines de organización académica
              por grado escolar; nunca se muestra públicamente ni se comparte
              con terceros)
            </li>
            <li>
              Rol dentro de la aplicación (estudiante o administrador/docente)
            </li>
          </ul>
          <p>
            Cuando el inicio de sesión se realiza mediante Google, recibimos
            únicamente el nombre, correo electrónico y foto de perfil asociados
            a la cuenta de Google utilizada, de acuerdo con los permisos que
            el propio usuario autoriza en ese momento. No accedemos a la
            contraseña de la cuenta de Google ni a ningún otro dato de esa
            cuenta.
          </p>

          <p className="pt-2">
            <strong>3.2 Información académica y de progreso (estudiantes)</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Cursos, unidades y clases en los que está inscrito</li>
            <li>
              Ejercicios completados, respuestas registradas y calificación
              obtenida en cada uno
            </li>
            <li>Rachas de estudio (días consecutivos de actividad)</li>
            <li>Recompensas (stickers, GIFs) obtenidas</li>
            <li>Historial de participación en juegos y salas de juego</li>
            <li>Puntos de experiencia y progreso general dentro de la app</li>
          </ul>

          <p className="pt-2">
            <strong>3.3 Contenido generado por administradores/docentes</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Imágenes, GIFs y archivos multimedia que suben para crear
              ejercicios, recompensas o material de las clases
            </li>
            <li>Textos, preguntas y respuestas de los ejercicios creados</li>
          </ul>

          <p className="pt-2">
            <strong>3.4 Datos técnicos y de uso</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Información básica del dispositivo (modelo, sistema operativo)
              con fines de soporte técnico y compatibilidad
            </li>
            <li>
              Registros de uso de la aplicación (por ejemplo, fecha de última
              actividad), utilizados para calcular rachas de estudio y
              estadísticas del panel de administrador
            </li>
          </ul>
        </Section>

        <Section id="permisos" title="4. Permisos que solicita la aplicación móvil">
          <p>
            La aplicación móvil de Zóe App puede solicitar los siguientes
            permisos del dispositivo, únicamente para las funciones
            educativas descritas:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Micrófono:</strong> utilizado exclusivamente durante los
              ejercicios de pronunciación (&quot;Speaking&quot;), para que el
              estudiante pueda repetir palabras en voz alta y la aplicación
              pueda reconocer y comparar la pronunciación. El audio se procesa
              en el momento del ejercicio y no se almacena como archivo de
              audio permanente ni se comparte con terceros ajenos al
              procesamiento del ejercicio.
            </li>
            <li>
              <strong>Cámara y galería de fotos:</strong> utilizado por
              administradores/docentes para seleccionar o tomar fotografías al
              crear ejercicios visuales (por ejemplo, galerías de imágenes o
              tarjetas de vocabulario). Los estudiantes no requieren este
              permiso para completar lecciones.
            </li>
            <li>
              <strong>Conexión a internet:</strong> requerida para sincronizar
              el progreso académico, cargar contenido de las lecciones y
              guardar los resultados de los ejercicios.
            </li>
          </ul>
          <p>
            Ningún permiso se utiliza para rastrear la ubicación del usuario,
            acceder a contactos, mensajes, ni ningún otro dato del dispositivo
            que no esté directamente relacionado con la función educativa
            descrita.
          </p>
        </Section>

        <Section id="uso-de-datos" title="5. Cómo utilizamos la información">
          <ul className="list-disc pl-6 space-y-2">
            <li>Brindar acceso al contenido educativo y hacer seguimiento del progreso académico</li>
            <li>Permitir que los administradores/docentes evalúen el desempeño de sus estudiantes</li>
            <li>Otorgar recompensas y mantener rachas de estudio como parte de la gamificación educativa</li>
            <li>Habilitar funciones de juegos y salas de juego en tiempo real entre estudiantes de una misma clase</li>
            <li>Brindar soporte técnico y solucionar errores de la aplicación</li>
            <li>Mejorar el contenido y funcionamiento general de la plataforma</li>
          </ul>
          <p>
            <strong>
              Zóe App no vende, alquila ni comparte información personal con
              fines publicitarios o comerciales de terceros.
            </strong>{" "}
            No mostramos anuncios de terceros dentro de la aplicación ni
            realizamos perfilamiento publicitario de estudiantes.
          </p>
        </Section>

        <Section id="terceros" title="6. Proveedores de servicios (terceros)">
          <p>
            Para operar la Aplicación, utilizamos los siguientes proveedores
            de infraestructura tecnológica, quienes procesan datos en nuestro
            nombre bajo sus propias políticas de seguridad y privacidad:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Supabase</strong> — utilizado como base de datos,
              autenticación y almacenamiento de archivos (imágenes y GIFs de
              ejercicios y recompensas).
            </li>
            <li>
              <strong>Vercel</strong> — utilizado para alojar el panel web de
              administración.
            </li>
            <li>
              <strong>Google (Google Sign-In)</strong> — utilizado
              opcionalmente como método de inicio de sesión para estudiantes.
            </li>
          </ul>
          <p>
            Estos proveedores tienen acceso técnico a los datos únicamente en
            la medida necesaria para prestar sus servicios de infraestructura,
            y no están autorizados a utilizar la información para fines
            propios ajenos a la operación de Zóe App.
          </p>
        </Section>

        <Section id="menores" title="7. Privacidad de niños, niñas y adolescentes">
          <p>
            Zóe App está diseñada para ser utilizada por estudiantes de nivel
            secundario, quienes en muchos casos son menores de edad. Por esta
            razón:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Las cuentas de estudiantes son creadas y gestionadas por su
              institución educativa o docente, quien actúa como responsable
              del uso de la plataforma por parte del estudiante.
            </li>
            <li>
              No solicitamos ni recopilamos información sensible (dirección
              física, número de teléfono, datos financieros) de los
              estudiantes.
            </li>
            <li>
              No se muestra publicidad de terceros ni se realiza seguimiento
              publicitario a ninguna cuenta identificada como estudiante.
            </li>
            <li>
              La información académica de un estudiante es visible únicamente
              para los administradores/docentes de su propia institución, no
              para otros estudiantes ni terceros.
            </li>
            <li>
              Las madres, padres o tutores legales, así como la institución
              educativa correspondiente, pueden solicitar la revisión,
              corrección o eliminación de los datos de un estudiante
              contactando directamente al correo indicado en la sección 11 de
              este documento.
            </li>
          </ul>
        </Section>

        <Section id="seguridad" title="8. Seguridad de la información">
          <p>
            Implementamos medidas técnicas y organizativas razonables para
            proteger la información contra accesos no autorizados,
            alteración, divulgación o destrucción, entre ellas:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Cifrado de contraseñas y comunicación mediante HTTPS/TLS</li>
            <li>
              Reglas de acceso a nivel de base de datos (Row Level Security)
              que restringen qué información puede ver cada rol de usuario
            </li>
            <li>
              Verificación de sesión e identidad antes de permitir el acceso
              al panel de administración
            </li>
          </ul>
          <p>
            Ningún sistema es completamente infalible; si llegáramos a
            detectar una vulneración de seguridad que afecte información
            personal, notificaremos a las instituciones educativas afectadas
            conforme a la normativa aplicable.
          </p>
        </Section>

        <Section id="retencion" title="9. Conservación y eliminación de datos">
          <p>
            Conservamos la información mientras la cuenta del usuario
            permanezca activa o mientras sea necesario para cumplir con los
            fines educativos descritos en esta política. Un administrador
            puede eliminar cuentas, clases o contenido desde el panel de
            administración. Al eliminar una cuenta o un curso, la información
            asociada (progreso, ejercicios completados, recompensas) se
            elimina de forma permanente de nuestros sistemas dentro de un
            plazo razonable.
          </p>
        </Section>

        <Section id="derechos" title="10. Derechos del usuario">
          <p>
            Los usuarios (o, en el caso de menores de edad, su madre, padre,
            tutor legal o institución educativa) pueden solicitar en
            cualquier momento:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Acceder a la información personal almacenada</li>
            <li>Corregir datos inexactos o desactualizados</li>
            <li>Solicitar la eliminación de la cuenta y sus datos asociados</li>
            <li>Revocar el acceso otorgado mediante inicio de sesión con Google</li>
          </ul>
          <p>
            Estas solicitudes pueden dirigirse al correo de contacto indicado
            en la sección siguiente, y serán atendidas en un plazo razonable.
          </p>
        </Section>

        <Section id="cambios" title="11. Cambios a esta política">
          <p>
            Podemos actualizar esta Política de Privacidad ocasionalmente
            para reflejar cambios en la Aplicación o en la normativa
            aplicable. La fecha de la última actualización se indica al
            inicio de este documento. En caso de cambios significativos, se
            notificará a los administradores a través del panel web o del
            correo electrónico registrado.
          </p>
        </Section>

        <Section id="contacto" title="12. Contacto">
          <p>
            Si tiene preguntas, comentarios o solicitudes relacionadas con
            esta Política de Privacidad o con el tratamiento de sus datos
            personales, puede comunicarse con nosotros a través de:
          </p>
          <p className="font-medium text-slate-900">
            Correo electrónico: [ZoeApp@ejemplo.com]
          </p>
        </Section>

        <footer className="border-t border-slate-200 pt-6 mt-12 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Zóe App. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  );
}
