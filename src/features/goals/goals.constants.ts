import { GoalType } from "./goals.types";

export const DEFAULT_GOAL_VALIDATIONS: Record<GoalType, Record<string, number | string>> = {
  points: { points: 100 },
  lesson: { lesson: "" },
  time: { time: 120 },
  classes: { classes: "" },
  streak: { streak: 1 },
  collection: { collection: 10 },
  approvals: { approvals: 5 },
  ranking: { ranking: 3 },
  hearts: { hearts: 5 }
};
