import { lesson_type } from "@/types/global.types";
import CompleteWordExerciseForm from "./admin/CompleteWordExerciseForm";
import GalleryExerciseForm from "./admin/GalleryExerciseForm";
import MatchNamesExerciseForm from "./admin/MatchNamesExerciseForm";
import OverviewExerciseForm from "./admin/OverviewExerciseForm";
import ReadExerciseForm from "./admin/ReadExerciseForm";
import SayWordExerciseForm from "./admin/SayWordExerciseForm";
import SpeakingExerciseForm from "./admin/SpeakingExerciseForm";
import StoryTellingExerciseForm from "./admin/StoryTellingExerciseForm";
import TypeAnswerExerciseForm from "./admin/TypeAnswerExerciseForm";
import VideoExerciseForm from "./admin/VideoExerciseForm";
import WriteWordExerciseForm from "./admin/WriteWordExerciseForm";

export const EXERCISE_COMPONENTS: Record<lesson_type, React.ComponentType<any>> = {
  type_answer: TypeAnswerExerciseForm,
  complete_word: CompleteWordExerciseForm,
  overview_session: OverviewExerciseForm,
  write_word: WriteWordExerciseForm,
  say_word: SayWordExerciseForm,
  image_gallery: GalleryExerciseForm,
  match_names: MatchNamesExerciseForm,
  speak: SpeakingExerciseForm,
  video_session: VideoExerciseForm,
  reading_quiz: ReadExerciseForm,
  audio_session: StoryTellingExerciseForm,
};
