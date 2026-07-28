import { Database } from "@/types/database.types";

export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type Reward = Database["public"]["Tables"]["reward"]["Row"];
export type GoalType = Database["public"]["Enums"]["goal_type"];

export interface GoalValidation {
  target: number;
}

export type GoalWithReward = Goal & {
  reward?: Reward | null;
  targetLabel?: string;
};

export type CreateGoalDTO = Omit<
  Database["public"]["Tables"]["goals"]["Insert"],
  "id" | "created_at" | "updated_at"
>;

export type UpdateGoalDTO = Database["public"]["Tables"]["goals"]["Update"] & {
  id: string;
};
