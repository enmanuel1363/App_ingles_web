import { lesson_type } from "@/types/global.types";

export type Exercise<T = any> = {
  id?: string;
  id_class: string;
  name: string;
  description: string;
  type: lesson_type;
  content: T;
  order_index: number;
  points_reward?: number | null;
  created_at?: string;
  updated_at?: string | null;
};

export type CreateExerciseDTO<T = any> = Omit<
  Exercise<T>,
  "id" | "created_at" | "updated_at"
>;
