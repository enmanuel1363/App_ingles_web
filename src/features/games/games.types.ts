export type GameType = "write" | "listen" | "speak" | "mix";

// Subtypes of game exercises as requested
export type WrittenGameExerciseType =
  | "match_name_to_picture" // Match the name to the picture
  | "identify_picture_reading_name" // Identify the picture's, Just Reading the name
  | "timed_typing_challenge" // Timed typing challenge
  | "crossword"
  | "match_word"; // Match word challenge

export type ListeningGameExerciseType =
  | "match_audio_to_text" // Listen and match audio to text
  | "identify_audio" // Listen to audio and identify correct option (with distractors)
  | "fast_audio_mode"; // Fast audio mode

export type SpeakingGameExerciseType =
  | "speak_before_timer" // Decir una frase antes de que acaben los 15 segundos
  | "say_5_words_quickly" // Decir 5 palabras rápidamente
  | "tongue_twister_challenge"; // Trabalenguas con número máximo de intentos

export type GameExerciseType =
  | WrittenGameExerciseType
  | ListeningGameExerciseType
  | SpeakingGameExerciseType;

export type Game = {
  id?: string;
  name: string;
  description?: string | null;
  type: GameType;
  created_by?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string | null;
};

export type ExerciseGame<T = any> = {
  id?: string;
  id_game: string;
  name: string;
  description?: string | null;
  type: string; // Stored as text to allow flexibility with GameExerciseType
  content: T;
  order_index: number;
  points_reward: number;
  created_at?: string;
  updated_at?: string | null;
};

export type ExerciseGameWithGame<T = any> = ExerciseGame<T> & {
  games?: {
    id: string;
    name: string;
    type: GameType;
    description?: string | null;
    is_active?: boolean;
  } | null;
};

export type GameWithExercises = Game & {
  exercises: ExerciseGame[];
};


export type GameStudentLog<T = any> = {
  id?: string;
  id_student_profile: string;
  id_game: string;
  score: number;
  time_spent?: number | null;
  answers_summary?: T | null;
  completed_at?: string;
};

export type GameRoomStatus = "waiting" | "playing" | "finished";

export type GameRoom<T = any> = {
  id?: string;
  room_code: string;
  id_game: string;
  host_id: string;
  status: GameRoomStatus;
  current_question_index: number;
  settings?: T | null;
  created_at?: string;
  updated_at?: string | null;
};

// DTOs for creation
export type CreateGameDTO = Omit<Game, "id" | "created_at" | "updated_at">;
export type CreateExerciseGameDTO = Omit<
  ExerciseGame,
  "id" | "created_at" | "updated_at"
>;
export type CreateGameStudentLogDTO = Omit<
  GameStudentLog,
  "id" | "completed_at"
>;
export type CreateGameRoomDTO = Omit<
  GameRoom,
  "id" | "created_at" | "updated_at"
>;
