import { Database } from "@/types/database.types";

export type Reward = Database["public"]["Tables"]["reward"]["Row"];
export type Goal = Database["public"]["Tables"]["goals"]["Row"];

export type RewardType = Database["public"]["Enums"]["reward_type"];

export type RewardWithGoal = Reward & {
  goal?: Goal | null;
};

export type CreateRewardDTO = Omit<
  Database["public"]["Tables"]["reward"]["Insert"],
  "id" | "created_at" | "updated_at"
>;

export type UpdateRewardDTO = Database["public"]["Tables"]["reward"]["Update"] & {
  id: string;
};
