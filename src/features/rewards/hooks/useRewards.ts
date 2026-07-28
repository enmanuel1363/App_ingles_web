"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rewardsService } from "../services/rewards.service";
import { CreateRewardDTO } from "../rewards.types";

export const useRewards = () => {
  const queryClient = useQueryClient();

  const {
    data: rewards = [],
    isLoading: isLoadingRewards,
    error: rewardsError,
  } = useQuery({
    queryKey: ["rewards"],
    queryFn: rewardsService.getRewards,
  });

  const {
    data: goals = [],
    isLoading: isLoadingGoals,
    error: goalsError,
  } = useQuery({
    queryKey: ["rewards-goals"],
    queryFn: rewardsService.getGoals,
  });

  const createRewardMutation = useMutation({
    mutationFn: ({ reward, file }: { reward: CreateRewardDTO; file?: File }) =>
      rewardsService.createReward(reward, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
  });

  const updateRewardMutation = useMutation({
    mutationFn: ({
      id,
      reward,
      file,
    }: {
      id: string;
      reward: Partial<CreateRewardDTO>;
      file?: File;
    }) => rewardsService.updateReward(id, reward, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
  });

  const deleteRewardMutation = useMutation({
    mutationFn: (id: string) => rewardsService.deleteReward(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
  });

  const handleCreateReward = async (reward: CreateRewardDTO, file?: File) => {
    try {
      await createRewardMutation.mutateAsync({ reward, file });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Error al crear la recompensa" };
    }
  };

  const handleUpdateReward = async (
    id: string,
    reward: Partial<CreateRewardDTO>,
    file?: File
  ) => {
    try {
      await updateRewardMutation.mutateAsync({ id, reward, file });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Error al actualizar la recompensa" };
    }
  };

  const handleDeleteReward = async (id: string) => {
    try {
      await deleteRewardMutation.mutateAsync(id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Error al eliminar la recompensa" };
    }
  };

  return {
    rewards,
    goals,
    isLoading: isLoadingRewards || isLoadingGoals,
    error: (rewardsError?.message || goalsError?.message || null),
    createReward: handleCreateReward,
    updateReward: handleUpdateReward,
    deleteReward: handleDeleteReward,
    refreshRewards: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      queryClient.invalidateQueries({ queryKey: ["rewards-goals"] });
    },
  };
};
