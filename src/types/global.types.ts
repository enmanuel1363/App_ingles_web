export type class_type = "mix" | "write" | "read" | "speak";

export type lesson_type =
  | "speak"
  | "write_word"
  | "image_gallery"
  | "reading_quiz"
  | "video_session"
  | "type_answer"
  | "complete_word"
  | "say_word"
  | "audio_session"
  | "match_names"
  | "match_words"
  | "overview_session"
  | "identify_picture";

export type difficulty_level = "low" | "medium" | "hard";

export type plan_status = "active" | "cancelled" | "past_due";

export type resource_type = "video" | "article";

export type reward_type = "gif" | "sticker";

export type user_role = "student" | "admin";

export type Reward = {
  id?: string;
  id_class: string;
  name: string;
  type: reward_type;
  url: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
