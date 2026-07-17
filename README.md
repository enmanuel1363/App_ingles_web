# App_ingles — Web (Admin)

Conversión de la app móvil (React Native / Expo) a **Next.js** (React puro, CSS normal), solo con las funcionalidades de administrador. El login con Google fue eliminado; el acceso es únicamente por email y contraseña vía Supabase.

## Estado: Fase 2 — Dashboard + Courses + Units ✅

Completado en esta fase:
- **Dashboard**: placeholder (igual que en la app original, ahí tampoco tenía lógica implementada)
- **Courses ("My Classes")**: listado real desde Supabase, tarjeta por curso con grado y cantidad de estudiantes, modal para crear nuevo curso (con selector de grado académico)
- **Units**: por cada curso (`/courses/[courseId]/units`), listado de unidades, modal para crear unidad con nombre/orden/dificultad
- Navegación con rutas dinámicas de Next.js (`[courseId]`, `[unitId]`) en vez de query params de Expo Router
- Placeholder para "Classes" (lecciones dentro de una unidad) — se completa en la Fase 3

## Pendiente (próximas fases)

- Fase 3: Classes (lecciones dentro de una unidad) + Lesson admin (los 11 tipos de lección y sus formularios)
- Fase 4: Rewards, Games, Profile (administrador)
- Fase 5: Reactivar autenticación + revisión general y ajustes finales

## Configuración

1. `npm install`
2. Copia `.env.local.example` a `.env.local` y completa tus credenciales de Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_KEY=
   ```
3. `npm run dev`

## Nota importante sobre roles

⚠️ **La autenticación está temporalmente desactivada** para facilitar el desarrollo. `/` redirige directo a `/dashboard` sin pedir login.

La versión original (login por email/contraseña + validación de rol `admin`) quedó respaldada en:
- `src/app/page.auth-backup.tsx`
- `src/app/(admin)/layout.auth-backup.tsx`

Al final del proyecto, para reactivarla: renombra `page.auth-backup.tsx` → `page.tsx` y `layout.auth-backup.tsx` → `layout.tsx` (reemplazando los actuales).
