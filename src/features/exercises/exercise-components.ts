import { lesson_type } from "@/types/global.types";
import CompleteWordExerciseForm from "./admin/CompleteWordExerciseForm";
import PlaceholderExerciseForm from "./admin/PlaceholderExerciseForm";
import TypeAnswerExerciseForm from "./admin/TypeAnswerExerciseForm";

export const EXERCISE_COMPONENTS: Record<lesson_type, React.ComponentType<any>> = {
  type_answer: TypeAnswerExerciseForm,
  complete_word: CompleteWordExerciseForm,

  // Pendientes — se reemplazan en las siguientes sub-fases (4b / 4c)
  speak: PlaceholderExerciseForm,
  write_word: PlaceholderExerciseForm,
  say_word: PlaceholderExerciseForm,
  image_gallery: PlaceholderExerciseForm,
  match_names: PlaceholderExerciseForm,
  video_session: PlaceholderExerciseForm,
  reading_quiz: PlaceholderExerciseForm,
  overview_session: PlaceholderExerciseForm,
  audio_session: PlaceholderExerciseForm,
};
