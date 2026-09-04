import { GameExerciseType, GameType } from "./games.types";

export interface Point {
  x: number;
  y: number;
}

export interface CaracterPoint {
  caracter: string;
  points: Point;
}

export interface CluePoint {
  text: string;
  color: string;
  points: Point;
}

export const GAME_EXERCISE_DEFAULT_CONTENT: Record<GameExerciseType, any> = {
  match_name_to_picture: {
    imageUrl: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  },
  identify_picture_reading_name: {
    wordToRead: "",
    imageOptions: [
      { id: "1", url: "", label: "" },
      { id: "2", url: "", label: "" },
    ],
    correctAnswer: "",
  },
  match_word: {
    items: [{ wordToMatch: "", correctAnswer: "", options: ["", "", ""] }],
  },
  crossword: {
    positions: [], // Point[]
    caracter: [], // CaracterPoint[]
    clue: [], // CluePoint[]
    backgroundUrl: "",
  },
  timed_typing_challenge: { words: [""], timeLimitSeconds: 30 },
  match_audio_to_text: {
    items: [{ phrase: "", answer: "" }],
  },
  identify_audio: {
    audioUrl: "",
    options: ["", "", ""],
    correctAnswer: "",
  },
  fast_audio_mode: {
    audioUrl: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    playbackRate: 1.6,
  },
  speak_before_timer: { phraseToSpeak: "", durationSeconds: 15 },
  say_5_words_quickly: { words: ["", "", "", "", ""], durationSeconds: 10 },
  tongue_twister_challenge: {
    tongueTwister: "",
    durationSeconds: 20,
    maxAttempts: 3,
  },
};

export const getDefaultContentSchema = (subtype: string): any => {
  return (
    GAME_EXERCISE_DEFAULT_CONTENT[subtype as GameExerciseType] || {
      tongueTwister: "",
      durationSeconds: 20,
      maxAttempts: 3,
    }
  );
};

export const WRITTEN_GAME_OPTIONS = [
  { value: "match_name_to_picture", label: "Match name to picture" },
  {
    value: "identify_picture_reading_name",
    label: "Identify picture's by name",
  },
  { value: "timed_typing_challenge", label: "Timed typing challenge" },
  { value: "match_word", label: "Match word challenge" },
  { value: "crossword", label: "Crossword challenge" },
];

export const LISTENING_GAME_OPTIONS = [
  { value: "match_audio_to_text", label: "Match audio to text" },
  { value: "identify_audio", label: "Identify audio" },
  { value: "fast_audio_mode", label: "Fast audio mode" },
];

export const SPEAKING_GAME_OPTIONS = [
  { value: "speak_before_timer", label: "Speak before timer ends" },
  { value: "say_5_words_quickly", label: "Say 5 words quickly" },
  { value: "tongue_twister_challenge", label: "Tongue twister challenge" },
];

export const getSubtypes = (
  gameType: GameType,
): { value: string; label: string }[] => {
  switch (gameType) {
    case "write":
      return WRITTEN_GAME_OPTIONS;
    case "listen":
      return LISTENING_GAME_OPTIONS;
    case "speak":
      return SPEAKING_GAME_OPTIONS;
    default:
      return [
        ...WRITTEN_GAME_OPTIONS,
        ...LISTENING_GAME_OPTIONS,
        ...SPEAKING_GAME_OPTIONS,
      ];
  }
};

export const GAME_TYPE_CONFIG: Record<
  GameType,
  { label: string; description: string; badgeColor: string; textColor: string; borderColor: string }
> = {
  write: {
    label: "Escritura",
    description: "Retos de vocabulario, ortografía y crucigramas",
    badgeColor: "bg-[#24DFE2]/20",
    textColor: "text-cyan-900",
    borderColor: "border-[#24DFE2]/40",
  },
  listen: {
    label: "Escucha",
    description: "Retos de comprensión auditiva y velocidad",
    badgeColor: "bg-[#B4FF2B]/25",
    textColor: "text-lime-950",
    borderColor: "border-[#B4FF2B]/40",
  },
  speak: {
    label: "Habla",
    description: "Retos de pronunciación oral y trabalenguas",
    badgeColor: "bg-[#FF9400]/20",
    textColor: "text-amber-950",
    borderColor: "border-[#FF9400]/40",
  },
  mix: {
    label: "Mixto",
    description: "Desafíos combinados de todas las destrezas",
    badgeColor: "bg-slate-100",
    textColor: "text-slate-800",
    borderColor: "border-slate-300",
  },
};

export const SUBTYPE_METADATA: Record<
  GameExerciseType,
  { label: string; gameType: GameType; shortDesc: string }
> = {
  match_name_to_picture: {
    label: "Match Name to Picture",
    gameType: "write",
    shortDesc: "Emparejar nombre con imagen",
  },
  identify_picture_reading_name: {
    label: "Identify Picture by Name",
    gameType: "write",
    shortDesc: "Identificar imagen leyendo el nombre",
  },
  timed_typing_challenge: {
    label: "Timed Typing Challenge",
    gameType: "write",
    shortDesc: "Mecanografía rápida contrarreloj",
  },
  match_word: {
    label: "Match Word Challenge",
    gameType: "write",
    shortDesc: "Emparejar palabras y significados",
  },
  crossword: {
    label: "Crossword Challenge",
    gameType: "write",
    shortDesc: "Crucigrama interactivo con pistas",
  },
  match_audio_to_text: {
    label: "Match Audio to Text",
    gameType: "listen",
    shortDesc: "Escuchar audio y emparejar con texto",
  },
  identify_audio: {
    label: "Identify Audio",
    gameType: "listen",
    shortDesc: "Identificar opción correcta por audio",
  },
  fast_audio_mode: {
    label: "Fast Audio Mode",
    gameType: "listen",
    shortDesc: "Comprensión auditiva a velocidad rápida",
  },
  speak_before_timer: {
    label: "Speak Before Timer Ends",
    gameType: "speak",
    shortDesc: "Pronunciar frase antes del tiempo límite",
  },
  say_5_words_quickly: {
    label: "Say 5 Words Quickly",
    gameType: "speak",
    shortDesc: "Decir 5 palabras rápidamente en el micro",
  },
  tongue_twister_challenge: {
    label: "Tongue Twister Challenge",
    gameType: "speak",
    shortDesc: "Desafío de trabalenguas con intentos",
  },
};

export const getSubtypeLabel = (subtype: string): string => {
  return (
    SUBTYPE_METADATA[subtype as GameExerciseType]?.label ||
    subtype.replace(/_/g, " ")
  );
};

