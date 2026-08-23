import { supabase } from "@/lib/supabase";
import {
  Game,
  CreateGameDTO,
  ExerciseGame,
  CreateExerciseGameDTO,
  GameStudentLog,
  CreateGameStudentLogDTO,
  GameRoom,
  CreateGameRoomDTO,
  GameRoomStatus,
} from "../games.types";

/**
 * Fetch all active games.
 */
export async function getGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Fetch a single game by ID.
 */
export async function getGameById(gameId: string): Promise<Game | null> {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch all exercises associated with a specific game.
 */
export async function getExercisesByGameId(gameId: string): Promise<ExerciseGame[]> {
  const { data, error } = await supabase
    .from("exercise_game")
    .select("*")
    .eq("id_game", gameId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Creates a game along with its exercises in a transactional manner.
 */
export async function createGameWithExercises(
  game: CreateGameDTO,
  exercises: Omit<CreateExerciseGameDTO, "id_game">[]
): Promise<{ game: Game; exercises: ExerciseGame[] }> {
  // 1. Insert game
  const { data: gameData, error: gameError } = await supabase
    .from("games")
    .insert([game])
    .select()
    .single();

  if (gameError) throw gameError;
  const newGame = gameData as Game;

  // 2. Prepare exercises with the new game's ID
  const exercisesWithGameId: CreateExerciseGameDTO[] = exercises.map(
    (exercise) => ({
      ...exercise,
      id_game: newGame.id!,
    })
  );

  // 3. Insert exercises (up to 8)
  const { data: exercisesData, error: exercisesError } = await supabase
    .from("exercise_game")
    .insert(exercisesWithGameId)
    .select();

  if (exercisesError) {
    // Attempt cleanup if something failed (since Supabase REST client doesn't support transactional rollback across tables out-of-the-box without RPC)
    await supabase.from("games").delete().eq("id", newGame.id!);
    throw exercisesError;
  }

  return {
    game: newGame,
    exercises: exercisesData as ExerciseGame[],
  };
}

/**
 * Log a student's score and answers for a game.
 */
export async function createStudentGameLog(
  log: CreateGameStudentLogDTO
): Promise<GameStudentLog> {
  const { data, error } = await supabase
    .from("game_student_log")
    .insert([log])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch logs for a specific student.
 */
export async function getStudentGameLogs(
  studentProfileId: string
): Promise<GameStudentLog[]> {
  const { data, error } = await supabase
    .from("game_student_log")
    .select("*, games(name, type)")
    .eq("id_student_profile", studentProfileId)
    .order("completed_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Create a multiplayer game room (Kahoot-style).
 */
export async function createGameRoom(
  room: CreateGameRoomDTO
): Promise<GameRoom> {
  const { data, error } = await supabase
    .from("game_room")
    .insert([room])
    .select()
    .single();

  if (error) throw error;
  return data as GameRoom;
}

/**
 * Fetch a game room by its unique room code.
 */
export async function getGameRoomByCode(
  roomCode: string
): Promise<GameRoom | null> {
  const { data, error } = await supabase
    .from("game_room")
    .select("*")
    .eq("room_code", roomCode.toUpperCase())
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No rows found
    throw error;
  }
  return data as GameRoom | null;
}

/**
 * Update the current status of a game room.
 */
export async function updateGameRoomStatus(
  roomId: string,
  status: GameRoomStatus
): Promise<GameRoom> {
  const { data, error } = await supabase
    .from("game_room")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", roomId)
    .select()
    .single();

  if (error) throw error;
  return data as GameRoom;
}

/**
 * Advance the question index in a game room.
 */
export async function updateGameRoomQuestionIndex(
  roomId: string,
  questionIndex: number
): Promise<GameRoom> {
  const { data, error } = await supabase
    .from("game_room")
    .update({
      current_question_index: questionIndex,
      updated_at: new Date().toISOString(),
    })
    .eq("id", roomId)
    .select()
    .single();

  if (error) throw error;
  return data as GameRoom;
}

/**
 * Update an existing game and replace its exercises.
 */
export async function updateGameWithExercises(
  gameId: string,
  game: Partial<CreateGameDTO>,
  exercises: Omit<CreateExerciseGameDTO, "id_game">[]
): Promise<{ game: Game; exercises: ExerciseGame[] }> {
  // 1. Update the game header
  const { data: gameData, error: gameError } = await supabase
    .from("games")
    .update({
      ...game,
      updated_at: new Date().toISOString(),
    })
    .eq("id", gameId)
    .select()
    .single();

  if (gameError) throw gameError;
  const updatedGame = gameData as Game;

  // 2. Delete all old exercises for this game
  const { error: deleteError } = await supabase
    .from("exercise_game")
    .delete()
    .eq("id_game", gameId);

  if (deleteError) throw deleteError;

  // 3. Prepare exercises with the game's ID
  const exercisesWithGameId: CreateExerciseGameDTO[] = exercises.map(
    (exercise) => ({
      ...exercise,
      id_game: gameId,
    })
  );

  // 4. Insert new/updated exercises
  const { data: exercisesData, error: exercisesError } = await supabase
    .from("exercise_game")
    .insert(exercisesWithGameId)
    .select();

  if (exercisesError) {
    throw exercisesError;
  }

  return {
    game: updatedGame,
    exercises: exercisesData as ExerciseGame[],
  };
}

/**
 * Delete a game and its exercises/rooms (via cascade).
 */
export async function deleteGame(gameId: string): Promise<void> {
  const { error } = await supabase
    .from("games")
    .delete()
    .eq("id", gameId);

  if (error) throw error;
}

/**
 * Fetch all game exercises of a specific subtype to allow copying/cloning.
 */
export async function getExercisesByType(type: string): Promise<any[]> {
  const { data, error } = await supabase
    .from("exercise_game")
    .select(`
      id,
      name,
      description,
      type,
      content,
      points_reward,
      games (
        name
      )
    `)
    .eq("type", type)
    .limit(50);

  if (error) throw error;
  return data || [];
}


