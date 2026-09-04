-- ======================================================================================
-- SISTEMA DE METAS (GOALS) Y LOGROS - SUPABASE POSTGRESQL
-- Documentación, Procedimientos Almacenados y Triggers
-- Ubicación: src/lib/queries/goals_system_procedures.sql
-- ======================================================================================

/*
  RESUMEN DEL FLUJO DE METAS Y RECOMPENSAS:
  1. El estudiante realiza una acción (completa ejercicio, racha, lección, etc.).
  2. Un TRIGGER asociado a la tabla de actividad invoca la función específica (ej. check_points_goals).
  3. La función busca si existen objetivos cumplidos que el estudiante aún no tenga registrados en `goal_student`.
  4. Si cumple la meta, se inserta una fila en `goal_student(id_goal, id_student_profile)`.
  5. La tabla `goal_student` tiene un TRIGGER automático (`trigger_handle_goal_student_reward`) 
     que ejecuta `internal.handle_goal_student_reward()`, otorgando automáticamente 
     la recompensa asociada en `reward_student` si la meta tenía una en `reward`.
*/

-- ======================================================================================
-- 0. DEFINICIÓN DEL ENUM Y TABLAS CLAVE
-- ======================================================================================
/*
  CREATE TYPE public.goal_type AS ENUM (
    'points',      -- Activo (check_points_goals en profiles)
    'streak',      -- Activo (check_streak_goals en streak_student)
    'lesson',      -- Activo (check_lesson_goals en class_student)
    'classes',     -- Activo (check_course_goals en course_student)
    'approvals',   -- Activo (check_approvals_goals en class_student)
    'time',        -- Activo (check_time_record_goals en game_student_log)
    'collection',  -- Activo (check_collection_goals en reward_student)
    'ranking',     -- Activo (evaluate_ranking_goals función / RPC / Cron)
    'hearts'       -- PENDIENTE (Pospuesto a petición del usuario)
  );
*/

-- ======================================================================================
-- PARTE 1: OBJETIVOS YA CUBIERTOS EN BASE DE DATOS
-- ======================================================================================

-----------------------------------------------------------------------------------------
-- 1.1 TIPO: 'points' (Puntos de Experiencia / XP)
-----------------------------------------------------------------------------------------
-- Función que evalúa si el nuevo total_exp del perfil alcanza metas de tipo 'points'
CREATE OR REPLACE FUNCTION public.check_points_goals()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
   -- Verificar que el nuevo total_exp no sea nulo y que haya cambiado respecto al anterior
   IF NEW.total_exp IS DISTINCT FROM OLD.total_exp AND NEW.total_exp IS NOT NULL THEN
      
      -- Insertar en la tabla goal_student todos los objetivos de tipo 'points'
      -- que el estudiante haya cumplido (puntos requeridos <= total_exp nuevo)
      -- y que aún no hayan sido registrados para este estudiante.
      INSERT INTO public.goal_student (id_goal, id_student_profile)
      SELECT g.id, NEW.id
      FROM public.goals g
      WHERE g.type = 'points'
        AND (g.validation->>'points') IS NOT NULL
        AND (g.validation->>'points')::integer <= NEW.total_exp
        AND NOT EXISTS (
            SELECT 1 
            FROM public.goal_student gs 
            WHERE gs.id_goal = g.id 
              AND gs.id_student_profile = NEW.id
        );

   END IF;
   
   RETURN NEW;
END;
$$;

-- Trigger asociado en la tabla profiles:
DROP TRIGGER IF EXISTS on_student_exp_update ON public.profiles;
CREATE TRIGGER on_student_exp_update
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_points_goals();


-----------------------------------------------------------------------------------------
-- 1.2 TIPO: 'streak' (Días de Racha Activa)
-----------------------------------------------------------------------------------------
-- Función que evalúa si longest_streak alcanza metas de tipo 'streak'
CREATE OR REPLACE FUNCTION public.check_streak_goals()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
   -- Verificar que la nueva racha más larga (longest_streak) no sea nula
   IF NEW.longest_streak IS NOT NULL THEN
      
      -- Insertar en la tabla goal_student todos los objetivos de tipo 'streak'
      -- que el estudiante haya cumplido (racha requerida <= longest_streak del estudiante)
      -- y que aún no hayan sido registrados para este estudiante.
      INSERT INTO public.goal_student (id_goal, id_student_profile)
      SELECT g.id, NEW.id_student_profile
      FROM public.goals g
      WHERE g.type = 'streak'
        AND (g.validation->>'streak') IS NOT NULL
        AND (g.validation->>'streak')::integer <= NEW.longest_streak
        AND NOT EXISTS (
            SELECT 1 
            FROM public.goal_student gs 
            WHERE gs.id_goal = g.id 
              AND gs.id_student_profile = NEW.id_student_profile
        );

   END IF;
   
   RETURN NEW;
END;
$$;

-- Triggers asociados en streak_student:
DROP TRIGGER IF EXISTS on_streak_inserted ON public.streak_student;
CREATE TRIGGER on_streak_inserted
AFTER INSERT ON public.streak_student
FOR EACH ROW
EXECUTE FUNCTION public.check_streak_goals();

DROP TRIGGER IF EXISTS on_streak_updated ON public.streak_student;
CREATE TRIGGER on_streak_updated
AFTER UPDATE ON public.streak_student
FOR EACH ROW
EXECUTE FUNCTION public.check_streak_goals();


-----------------------------------------------------------------------------------------
-- 1.3 DISPARADOR GLOBAL DE RECOMPENSAS ASOCIADAS
-----------------------------------------------------------------------------------------
-- Cuando se crea una fila en goal_student, este trigger entrega el item en reward_student
CREATE OR REPLACE FUNCTION internal.handle_goal_student_reward()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_reward_id UUID;
BEGIN
    SELECT id INTO v_reward_id
    FROM public.reward
    WHERE id_goal = NEW.id_goal;

    IF v_reward_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1
            FROM public.reward_student
            WHERE id_reward = v_reward_id
              AND id_student_profile = NEW.id_student_profile
        ) THEN
            INSERT INTO public.reward_student (id_reward, id_student_profile)
            VALUES (v_reward_id, NEW.id_student_profile);
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_handle_goal_student_reward ON public.goal_student;
CREATE TRIGGER trigger_handle_goal_student_reward
AFTER INSERT ON public.goal_student
FOR EACH ROW
EXECUTE FUNCTION internal.handle_goal_student_reward();



-- ======================================================================================
-- PARTE 2: PROCEDIMIENTOS ACTIVADOS PARA METAS ADICIONALES
-- ======================================================================================

-----------------------------------------------------------------------------------------
-- 2.1 TIPO: 'lesson' (Completar una lección específica)
-- Formato esperado en validation: { "lesson": "<class_uuid>" }
-- Tabla monitorizada: public.class_student
-----------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_lesson_goals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
   -- Solo evaluar si la lección fue completada satisfactoriamente
   IF NEW.is_completed = true AND (OLD IS NULL OR OLD.is_completed IS NOT TRUE) THEN
      
      INSERT INTO public.goal_student (id_goal, id_student_profile)
      SELECT g.id, NEW.id_student_profile
      FROM public.goals g
      WHERE g.type = 'lesson'
        AND (g.validation->>'lesson') IS NOT NULL
        AND (g.validation->>'lesson')::uuid = NEW.id_class
        AND NOT EXISTS (
            SELECT 1 
            FROM public.goal_student gs 
            WHERE gs.id_goal = g.id 
              AND gs.id_student_profile = NEW.id_student_profile
        );

   END IF;
   
   RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_class_student_completed_lesson ON public.class_student;
CREATE TRIGGER on_class_student_completed_lesson
AFTER INSERT OR UPDATE OF is_completed ON public.class_student
FOR EACH ROW
EXECUTE FUNCTION public.check_lesson_goals();


-----------------------------------------------------------------------------------------
-- 2.2 TIPO: 'classes' (Curso completado / Todas las clases del curso)
-- En el frontend actual se asocia a un curso: { "classes": "<course_uuid>" }
-- Tabla monitorizada: public.course_student
-----------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_course_goals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
   -- Evaluar si el curso se marcó como completado o alcanzó el 100% de progreso
   IF (NEW.has_complete = true OR NEW.overall_progress_percentage >= 100) 
      AND (OLD IS NULL OR (OLD.has_complete IS NOT TRUE AND COALESCE(OLD.overall_progress_percentage, 0) < 100)) THEN
      
      INSERT INTO public.goal_student (id_goal, id_student_profile)
      SELECT g.id, NEW.id_student_profile
      FROM public.goals g
      WHERE g.type = 'classes'
        AND (g.validation->>'classes') IS NOT NULL
        AND (g.validation->>'classes')::uuid = NEW.id_course
        AND NOT EXISTS (
            SELECT 1 
            FROM public.goal_student gs 
            WHERE gs.id_goal = g.id 
              AND gs.id_student_profile = NEW.id_student_profile
        );

   END IF;
   
   RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_course_student_completed ON public.course_student;
CREATE TRIGGER on_course_student_completed
AFTER INSERT OR UPDATE OF has_complete, overall_progress_percentage ON public.course_student
FOR EACH ROW
EXECUTE FUNCTION public.check_course_goals();


-----------------------------------------------------------------------------------------
-- 2.3 TIPO: 'approvals' (Acumular N lecciones aprobadas)
-- Formato en validation: { "approvals": 5 }
-- Tabla monitorizada: public.class_student
-----------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_approvals_goals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
   v_completed_count integer;
BEGIN
   -- Se dispara cuando una lección se marca como completada
   IF NEW.is_completed = true AND (OLD IS NULL OR OLD.is_completed IS NOT TRUE) THEN
      
      -- Contar cuántas lecciones únicas completadas tiene el estudiante
      SELECT COUNT(DISTINCT id_class) INTO v_completed_count
      FROM public.class_student
      WHERE id_student_profile = NEW.id_student_profile
        AND is_completed = true;

      -- Asignar los objetivos donde la meta sea <= total de lecciones completadas
      INSERT INTO public.goal_student (id_goal, id_student_profile)
      SELECT g.id, NEW.id_student_profile
      FROM public.goals g
      WHERE g.type = 'approvals'
        AND (g.validation->>'approvals') IS NOT NULL
        AND (g.validation->>'approvals')::integer <= v_completed_count
        AND NOT EXISTS (
            SELECT 1 
            FROM public.goal_student gs 
            WHERE gs.id_goal = g.id 
              AND gs.id_student_profile = NEW.id_student_profile
        );

   END IF;
   
   RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_class_student_approvals_check ON public.class_student;
CREATE TRIGGER on_class_student_approvals_check
AFTER INSERT OR UPDATE OF is_completed ON public.class_student
FOR EACH ROW
EXECUTE FUNCTION public.check_approvals_goals();


-----------------------------------------------------------------------------------------
-- 2.4 TIPO: 'time' (Completar actividad o juego en tiempo récord <= N segundos)
-- Formato en validation: { "time": 120 }
-- Tabla monitorizada: public.game_student_log
-----------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_time_record_goals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
   -- Si la actividad se completó y se registró tiempo invertido menor o igual al récord
   IF NEW.time_spent IS NOT NULL AND NEW.time_spent > 0 THEN
      
      INSERT INTO public.goal_student (id_goal, id_student_profile)
      SELECT g.id, NEW.id_student_profile
      FROM public.goals g
      WHERE g.type = 'time'
        AND (g.validation->>'time') IS NOT NULL
        -- Se cumple si el tiempo gastado fue menor o igual al tiempo objetivo
        AND NEW.time_spent <= (g.validation->>'time')::integer
        AND NOT EXISTS (
            SELECT 1 
            FROM public.goal_student gs 
            WHERE gs.id_goal = g.id 
              AND gs.id_student_profile = NEW.id_student_profile
        );

   END IF;
   
   RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_game_time_record_check ON public.game_student_log;
CREATE TRIGGER on_game_time_record_check
AFTER INSERT ON public.game_student_log
FOR EACH ROW
EXECUTE FUNCTION public.check_time_record_goals();


-----------------------------------------------------------------------------------------
-- 2.5 TIPO: 'collection' (Colección de recompensas)
-- Formato en validation: { "collection": 10 }
-- Tabla monitorizada: public.reward_student (recompensas acumuladas)
-----------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_collection_goals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
   v_reward_count integer;
BEGIN
   -- Contar las recompensas totales que posee el alumno
   SELECT COUNT(DISTINCT id_reward) INTO v_reward_count
   FROM public.reward_student
   WHERE id_student_profile = NEW.id_student_profile;

   INSERT INTO public.goal_student (id_goal, id_student_profile)
   SELECT g.id, NEW.id_student_profile
   FROM public.goals g
   WHERE g.type = 'collection'
     AND (g.validation->>'collection') IS NOT NULL
     AND (g.validation->>'collection')::integer <= v_reward_count
     AND NOT EXISTS (
         SELECT 1 
         FROM public.goal_student gs 
         WHERE gs.id_goal = g.id 
           AND gs.id_student_profile = NEW.id_student_profile
     );

   RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_reward_collection_check ON public.reward_student;
CREATE TRIGGER on_reward_collection_check
AFTER INSERT ON public.reward_student
FOR EACH ROW
EXECUTE FUNCTION public.check_collection_goals();


-----------------------------------------------------------------------------------------
-- 2.6 TIPO: 'hearts' (Conservar corazones al máximo) - [PENDIENTE / POSPUESTO]
-- Formato en validation: { "hearts": 5 }
-- Se implementará cuando se defina la mecánica exacta de entrega.
-----------------------------------------------------------------------------------------
/*
CREATE OR REPLACE FUNCTION public.check_hearts_goals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
   IF NEW.current_hearts IS NOT NULL AND (OLD IS NULL OR NEW.current_hearts > OLD.current_hearts) THEN
      INSERT INTO public.goal_student (id_goal, id_student_profile)
      SELECT g.id, NEW.id
      FROM public.goals g
      WHERE g.type = 'hearts'
        AND (g.validation->>'hearts') IS NOT NULL
        AND NEW.current_hearts >= (g.validation->>'hearts')::integer
        AND NOT EXISTS (
            SELECT 1 
            FROM public.goal_student gs 
            WHERE gs.id_goal = g.id 
              AND gs.id_student_profile = NEW.id
        );
   END IF;
   RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profiles_hearts_check ON public.profiles;
CREATE TRIGGER on_profiles_hearts_check
AFTER UPDATE OF current_hearts ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_hearts_goals();
*/


-----------------------------------------------------------------------------------------
-- 2.7 TIPO: 'ranking' (Puesto en la Liga / Top N estudiantes)
-- Formato en validation: { "ranking": 3 } (ej. quedar en Top 3)
-- Generalmente ejecutado vía CRON periódico o RPC semanal al cerrar el ciclo de liga
-----------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.evaluate_ranking_goals()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
   r RECORD;
BEGIN
   -- Asignar ranking según total_exp o actividad semanal
   FOR r IN (
      WITH ranked_students AS (
         SELECT 
            id as id_student_profile,
            DENSE_RANK() OVER (ORDER BY total_exp DESC) as rank_position
         FROM public.profiles
         WHERE role = 'student'
      )
      SELECT 
         rs.id_student_profile,
         rs.rank_position,
         g.id as id_goal
      FROM ranked_students rs
      JOIN public.goals g ON g.type = 'ranking'
      WHERE (g.validation->>'ranking') IS NOT NULL
        AND rs.rank_position <= (g.validation->>'ranking')::integer
        AND NOT EXISTS (
           SELECT 1 
           FROM public.goal_student gs 
           WHERE gs.id_goal = g.id 
             AND gs.id_student_profile = rs.id_student_profile
        )
   ) LOOP
      INSERT INTO public.goal_student (id_goal, id_student_profile)
      VALUES (r.id_goal, r.id_student_profile);
   END LOOP;
END;
$$;
