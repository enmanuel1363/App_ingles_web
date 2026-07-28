import { Database } from "@/types/database.types";

export interface DashboardStats {
  activeStudents: number;
  totalClasses: number;
  claimedRewards: number;
  averageScore: number;
}

export interface RecentActivity {
  id: string;
  score: number;
  isComplete: boolean;
  createdAt: string;
  exerciseName: string;
  exerciseType: Database["public"]["Enums"]["lesson_type"];
  studentName: string;
}

export interface TopStreak {
  id: string;
  currentStreak: number;
  longestStreak: number;
  studentName: string;
  avatarUrl: string | null;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  topStreaks: TopStreak[];
}
