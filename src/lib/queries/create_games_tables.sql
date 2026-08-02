-- SQL Query executed to set up Games, Exercise Games, Game Logs, and Game Rooms
-- Executed on: 2026-08-01

-- 1. Create the game_type enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.game_type AS ENUM ('write', 'listen', 'speak', 'mix');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create games table
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    type public.game_type NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create exercise_game table
CREATE TABLE IF NOT EXISTS public.exercise_game (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_game UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    content JSONB NOT NULL,
    order_index INTEGER NOT NULL,
    points_reward INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create game_student_log table
CREATE TABLE IF NOT EXISTS public.game_student_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_student_profile UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    id_game UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    time_spent INTEGER,
    answers_summary JSONB,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create game_room table
CREATE TABLE IF NOT EXISTS public.game_room (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code TEXT NOT NULL UNIQUE,
    id_game UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'waiting',
    current_question_index INTEGER NOT NULL DEFAULT 0,
    settings JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_game ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_student_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_room ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to ensure idempotency)
DROP POLICY IF EXISTS "Allow read access to authenticated users on games" ON public.games;
DROP POLICY IF EXISTS "Allow write access to admins on games" ON public.games;
DROP POLICY IF EXISTS "Allow read access to authenticated users on exercise_game" ON public.exercise_game;
DROP POLICY IF EXISTS "Allow write access to admins on exercise_game" ON public.exercise_game;
DROP POLICY IF EXISTS "Allow students to manage their own logs" ON public.game_student_log;
DROP POLICY IF EXISTS "Allow admins to read all logs" ON public.game_student_log;
DROP POLICY IF EXISTS "Allow host to manage game rooms" ON public.game_room;
DROP POLICY IF EXISTS "Allow students to view game rooms" ON public.game_room;

-- Create RLS Policies
-- Games Policies
CREATE POLICY "Allow read access to authenticated users on games" 
ON public.games FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow write access to admins on games" 
ON public.games FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::public.roles
    )
);

-- Exercise Game Policies
CREATE POLICY "Allow read access to authenticated users on exercise_game" 
ON public.exercise_game FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow write access to admins on exercise_game" 
ON public.exercise_game FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::public.roles
    )
);

-- Game Student Log Policies
CREATE POLICY "Allow students to manage their own logs" 
ON public.game_student_log FOR ALL 
TO authenticated 
USING (auth.uid() = id_student_profile)
WITH CHECK (auth.uid() = id_student_profile);

CREATE POLICY "Allow admins to read all logs" 
ON public.game_student_log FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::public.roles
    )
);

-- Game Room Policies
CREATE POLICY "Allow host to manage game rooms" 
ON public.game_room FOR ALL 
TO authenticated 
USING (host_id = auth.uid())
WITH CHECK (host_id = auth.uid());

CREATE POLICY "Allow students to view game rooms" 
ON public.game_room FOR SELECT 
TO authenticated 
USING (true);
