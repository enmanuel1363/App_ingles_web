import { supabase } from "@/lib/supabase";
import { CreateRewardDTO, Reward, RewardWithGoal, Goal } from "../rewards.types";
import { uploadFile } from "@/features/exercises/services/storage.service";

export const rewardsService = {
  async getRewards(): Promise<RewardWithGoal[]> {
    const { data, error } = await supabase
      .from("reward")
      .select("*, goals(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    return (data || []).map((reward: any) => ({
      ...reward,
      goal: reward.goals,
    }));
  },

  async getGoals(): Promise<Goal[]> {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createReward(
    reward: CreateRewardDTO,
    file?: File
  ): Promise<Reward> {
    let finalUrl = reward.url;

    if (file) {
      finalUrl = await uploadFile(file, "exercise-assets");
    }

    const { data, error } = await supabase
      .from("reward")
      .insert({
        ...reward,
        url: finalUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateReward(
    id: string,
    reward: Partial<CreateRewardDTO>,
    file?: File
  ): Promise<Reward> {
    let finalUrl = reward.url;

    if (file) {
      finalUrl = await uploadFile(file, "exercise-assets");
    }

    const { data, error } = await supabase
      .from("reward")
      .update({
        ...reward,
        ...(finalUrl ? { url: finalUrl } : {}),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteReward(id: string): Promise<void> {
    const { error } = await supabase
      .from("reward")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
};
