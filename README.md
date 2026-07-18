# App_ingles — Web (Admin)

Conversión de la app móvil (React Native / Expo) a **Next.js** (React puro, CSS normal), solo con las funcionalidades de administrador. El login con Google fue eliminado; el acceso es únicamente por email y contraseña vía Supabase.

## Estado: Fase 4c — Últimos 4 tipos ✅ (Fase 4 completa: 11/11 tipos)

Completado en esta fase:
- **Video session** — URL de YouTube + nota aclaratoria
- **Speaking** — respuesta correcta para comparar pronunciación
- **Reading quiz** — frase, respuesta correcta y respuestas posibles (pastillas)
- **Story Telling (audio_session)** — imagen de portada, historia y preguntas de opción múltiple con respuesta correcta marcada
- 🎉 **Los 11 tipos de lección están completos y funcionales**: Type Answer, Complete Word, Vocabulary, Write a word, Say the word, Image gallery, Match the names, Video session, Speaking, Reading quiz, Story Telling

## Pendiente (próximas fases)

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
