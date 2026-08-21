import { lesson_type } from "@/types/global.types";

export const lessonTypeOptions: {
  label: string;
  value: lesson_type;
  icon: string; // Lucide icon name reference
  color: string;
}[] = [
  {
    label: "Vocabulary",
    value: "overview_session",
    icon: "Languages",
    color: "#A855F7",
  },
  {
    label: "Video session",
    value: "video_session",
    icon: "Play",
    color: "#F43F5E",
  },
  {
    label: "Image gallery",
    value: "image_gallery",
    icon: "Image",
    color: "#EC4899",
  },
  {
    label: "Story Telling",
    value: "audio_session",
    icon: "BookOpen",
    color: "#2DD4BF",
  },
  {
    label: "Reading quiz",
    value: "reading_quiz",
    icon: "FileText",
    color: "#14B8A6",
  },
  {
    label: "Match the names",
    value: "match_names",
    icon: "Link2",
    color: "#006668",
  },
  {
    label: "Match the words",
    value: "match_words",
    icon: "Columns",
    color: "#0F766E",
  },
  {
    label: "Complete word",
    value: "complete_word",
    icon: "Type",
    color: "#F97316",
  },
  { label: "Speaking", value: "speak", icon: "Mic", color: "#EF4444" },
  {
    label: "Say the word",
    value: "say_word",
    icon: "Volume2",
    color: "#D946EF",
  },
  {
    label: "Type answer",
    value: "type_answer",
    icon: "Keyboard",
    color: "#84CC16",
  },
  {
    label: "Write a word",
    value: "write_word",
    icon: "PenTool",
    color: "#6366F1",
  },
  {
    label: "Identify picture",
    value: "identify_picture",
    icon: "Volume2",
    color: "#0EA5E9",
  },
];

export const EXERCISE_CATEGORIES: Record<lesson_type, string> = {
  overview_session: "Introducción",
  video_session: "Introducción",
  image_gallery: "Introducción",
  audio_session: "Desarrollo",
  reading_quiz: "Desarrollo",
  match_names: "Desarrollo",
  match_words: "Desarrollo",
  complete_word: "Validación",
  write_word: "Validación",
  type_answer: "Validación",
  say_word: "Validación",
  speak: "Validación",
  identify_picture: "Validación",
};

export const EXERCISE_DEFAULT_CONTENT: Record<lesson_type, any> = {
  complete_word: {
    items: [{ sentence: "", correct_answer: "", possible_answers: [] }],
  },
  image_gallery: { items: [{ images: [] }] },
  match_names: { items: [{ images: [] }] },
  match_words: { type: "translation", items: [{ pairs: [{ english: "", spanish: "" }] }] },
  overview_session: { items: [{ words: [] }] },
  reading_quiz: {
    items: [{ phrase: "", questions: [] }],
  },
  say_word: { items: [{ image_url: "", image_title: "" }] },
  type_answer: {
    items: [{ correct_answer: "", clues: [], descriptive_text: "" }],
  },
  video_session: { items: [{ video_url: "", disclaimer: "" }] },
  write_word: { mode: "free_input", items: [{ image_url: "", image_title: "" }] },
  audio_session: { items: [{ fragments: [{ cover_image: "", story: "" }], questions: [] }] },
  speak: { items: [{ correct_answer: "" }] },
  identify_picture: { items: [{ audio_url: "", images: [] }] },
};

export const EXERCISE_DEFAULT_DESCRIPTIONS: Record<lesson_type, string> = {
  overview_session: "Learn the vocabulary words",
  say_word: "Say the word that corresponds to the image",
  audio_session: "Read the story and answer the questions",
  complete_word: "",
  image_gallery: "",
  match_names: "",
  match_words: "Match the English words with their correct Spanish meanings",
  reading_quiz: "",
  type_answer: "",
  video_session: "",
  write_word: "",
  speak: "",
  identify_picture: "Escucha el audio y selecciona la imagen correcta",
};
