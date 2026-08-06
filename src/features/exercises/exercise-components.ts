import { lesson_type } from "@/types/global.types";
import CompleteWordExerciseForm from "./components/CompleteWordExerciseForm";
import GalleryExerciseForm from "./components/GalleryExerciseForm";
import MatchNamesExerciseForm from "./components/MatchNamesExerciseForm";
import MatchWordsExerciseForm from "./components/MatchWordsExerciseForm";
import OverviewExerciseForm from "./components/OverviewExerciseForm";
import ReadExerciseForm from "./components/ReadExerciseForm";
import SayWordExerciseForm from "./components/SayWordExerciseForm";
import SpeakingExerciseForm from "./components/SpeakingExerciseForm";
import StoryTellingExerciseForm from "./components/StoryTellingExerciseForm";
import TypeAnswerExerciseForm from "./components/TypeAnswerExerciseForm";
import VideoExerciseForm from "./components/VideoExerciseForm";
import WriteWordExerciseForm from "./components/WriteWordExerciseForm";

export const EXERCISE_COMPONENTS: Record<lesson_type, React.ComponentType<any>> = {
  type_answer: TypeAnswerExerciseForm,
  complete_word: CompleteWordExerciseForm,
  overview_session: OverviewExerciseForm,
  write_word: WriteWordExerciseForm,
  say_word: SayWordExerciseForm,
  image_gallery: GalleryExerciseForm,
  match_names: MatchNamesExerciseForm,
  match_words: MatchWordsExerciseForm,
  speak: SpeakingExerciseForm,
  video_session: VideoExerciseForm,
  reading_quiz: ReadExerciseForm,
  audio_session: StoryTellingExerciseForm,
};
