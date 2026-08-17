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
