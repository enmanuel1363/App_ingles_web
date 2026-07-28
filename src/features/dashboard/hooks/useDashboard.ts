"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";

export const useDashboard = () => {
  const queryClient = useQueryClient();

  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardService.getStats,
  });

  const {
    data: recentActivities = [],
    isLoading: isLoadingActivities,
    error: activitiesError,
  } = useQuery({
    queryKey: ["dashboard-activities"],
    queryFn: dashboardService.getRecentActivities,
  });

  const {
    data: topStreaks = [],
    isLoading: isLoadingStreaks,
    error: streaksError,
  } = useQuery({
    queryKey: ["dashboard-streaks"],
    queryFn: dashboardService.getTopStreaks,
  });

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard-activities"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard-streaks"] }),
    ]);
  };

  const isLoading = isLoadingStats || isLoadingActivities || isLoadingStreaks;
  
  const errorMessage = 
    (statsError?.message || "") || 
    (activitiesError?.message || "") || 
    (streaksError?.message || "");

  return {
    stats: stats || { activeStudents: 0, totalClasses: 0, claimedRewards: 0, averageScore: 0 },
    recentActivities,
    topStreaks,
    isLoading,
    error: errorMessage || null,
    refreshDashboard: handleRefresh,
  };
};
