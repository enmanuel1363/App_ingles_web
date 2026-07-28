import { class_type } from "@/types/global.types";

export type ClassModel = {
  id?: string;
  id_unit: string;
  name: string;
  type: class_type;
  order_index: number;
  created_at?: string;
  updated_at?: string | null;
};

export type CreateClassDTO = Omit<
  ClassModel,
  "id" | "created_at" | "updated_at"
>;
