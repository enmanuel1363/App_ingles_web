import { difficulty_level } from "@/types/global.types";

export type Unit = {
  id?: string;
  id_course: string;
  name: string;
  order_index: number;
  difficulty: difficulty_level;
  created_at?: string;
  updated_at?: string;
};
