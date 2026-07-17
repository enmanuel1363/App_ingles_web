# App_ingles — Web (Admin)

Conversión de la app móvil (React Native / Expo) a **Next.js** (React puro, CSS normal), solo con las funcionalidades de administrador. El login con Google fue eliminado; el acceso es únicamente por email y contraseña vía Supabase.

## Estado: Fase 4a — Infraestructura de Exercises + 2 de 11 tipos ✅

Completado en esta fase:
- **Infraestructura completa de ejercicios**: tipos, servicio de Supabase, store de edición (Zustand), servicio de subida de archivos a Storage adaptado a `File` del navegador (`storage.service.ts`)
- **Página "Config exercises"** (`/courses/[courseId]/units/[unitId]/classes/[classId]/exercises`): agregar/quitar/reordenar slots de ejercicio, validaciones (mínimo 2 de "Introducción", mínimo 3 de "Validación", máximo 12 items en total), guardar todo
- Selector de tipo de ejercicio por slot, con categorías
- **2 de 11 tipos de lección completamente funcionales**: Type Answer y Complete Word
- Los 9 tipos restantes muestran un formulario "pendiente" (placeholder) — se completan en las Fases 4b y 4c

## Pendiente (próximas fases)

- Fase 4b: tipos con carga de imagen simple — Write a word, Say the word, Image gallery, Match the names
- Fase 4c: tipos con audio/video/otros — Video session, Story Telling, Vocabulary (overview), Reading quiz, Speaking
- Fase 5: Rewards, Games, Profile (administrador)
- Fase 6: Reactivar autenticación + revisión general y ajustes finales

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
