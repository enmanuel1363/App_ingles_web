"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { goalsService } from "../services/goals.service";
import { CreateGoalDTO } from "../goals.types";

export const useGoals = () => {
  const queryClient = useQueryClient();

  const {
    data: goals = [],
    isLoading: isLoadingGoals,
    error: goalsError,
  } = useQuery({
    queryKey: ["goals"],
    queryFn: goalsService.getGoals,
  });

  const createGoalMutation = useMutation({
    mutationFn: ({ goal, rewardId }: { goal: CreateGoalDTO; rewardId?: string }) =>
      goalsService.createGoal(goal, rewardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      // Invalida recompensas por si cambió la asociación
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({
      id,
      goal,
      rewardId,
    }: {
      id: string;
      goal: Partial<CreateGoalDTO>;
      rewardId?: string;
    }) => goalsService.updateGoal(id, goal, rewardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => goalsService.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
  });

  const handleCreateGoal = async (goal: CreateGoalDTO, rewardId?: string) => {
    try {
      await createGoalMutation.mutateAsync({ goal, rewardId });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Error al crear el objetivo" };
    }
  };

  const handleUpdateGoal = async (
    id: string,
    goal: Partial<CreateGoalDTO>,
    rewardId?: string
  ) => {
    try {
      await updateGoalMutation.mutateAsync({ id, goal, rewardId });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Error al actualizar el objetivo" };
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteGoalMutation.mutateAsync(id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Error al eliminar el objetivo" };
    }
  };

  return {
    goals,
    isLoading: isLoadingGoals,
    error: goalsError?.message || null,
    createGoal: handleCreateGoal,
    updateGoal: handleUpdateGoal,
    deleteGoal: handleDeleteGoal,
    refreshGoals: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  };
};
