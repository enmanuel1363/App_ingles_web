"use client";

import React, { useState } from "react";
import { Plus, Gift, RefreshCw, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { useRewards } from "../hooks/useRewards";
import RewardCard from "./RewardCard";
import CreateRewardModal from "./CreateRewardModal";
import { RewardWithGoal, CreateRewardDTO } from "../rewards.types";
import { useModal } from "@/components/ui/ModalProvider";

export default function RewardsPage() {
  const {
    rewards,
    goals,
    isLoading,
    error,
    createReward,
    updateReward,
    deleteReward,
    refreshRewards,
  } = useRewards();
  const { showAlert } = useModal();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReward, setSelectedReward] = useState<RewardWithGoal | null>(
    null,
  );

  const handleEditClick = (reward: RewardWithGoal) => {
    setSelectedReward(reward);
    setModalVisible(true);
  };

  const handleCreateClick = () => {
    setSelectedReward(null);
    setModalVisible(true);
  };

  const handleSaveReward = async (
    rewardData: CreateRewardDTO,
    file?: File,
  ): Promise<boolean> => {
    if (selectedReward) {
      // Edit
      const res = await updateReward(selectedReward.id, rewardData, file);
      if (res.success) {
        showAlert({
          title: "Reward saved",
          message: "The reward has been updated successfully.",
          type: "success",
        });
        return true;
      } else {
        showAlert({
          title: "Error",
          message: `Error updating reward: ${res.error}`,
          type: "error",
        });
        return false;
      }
    } else {
      // Create
      const res = await createReward(rewardData, file);
      if (res.success) {
        showAlert({
          title: "Reward created",
          message: "The reward has been created successfully.",
          type: "success",
        });
        return true;
      } else {
        showAlert({
          title: "Error",
          message: `Error creating reward: ${res.error}`,
          type: "error",
        });
        return false;
      }
    }
  };

  const handleDeleteReward = async (id: string) => {
    const res = await deleteReward(id);
    if (!res.success) {
      showAlert({
        title: "Error",
        message: `Error deleting reward: ${res.error}`,
        type: "error",
      });
    } else {
      showAlert({
        title: "Reward deleted",
        message: "The reward has been deleted successfully.",
        type: "success",
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header Card */}
      <div className="border-b border-slate-200/80  p-2 md:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            Rewards Management
          </h1>
          <p className="text-sm font-semibold text-slate-500">
            Manage stickers and animated GIFs that students can unlock by completing goals.
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            variant="outlined"
            onClick={refreshRewards}
            disabled={isLoading}
            className="p-3"
            aria-label="Refresh list"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>

          <Button
            variant="primary"
            onClick={handleCreateClick}
            leftIcon={<Plus className="w-5 h-5" />}
            className="shadow-sm flex-1 sm:flex-initial"
          >
            Add Reward
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl p-5 flex items-start space-x-3.5 shadow-sm">
          <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-900">Error loading data</h4>
            <p className="text-sm text-rose-700/90 mt-1">{error}</p>
            <Button
              variant="outlined"
              onClick={refreshRewards}
              className="mt-3.5 text-xs py-2 bg-white text-rose-700 border-rose-200 hover:bg-rose-100/50"
            >
              Try again
            </Button>
          </div>
        </div>
      )}

      {/* Content grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-sm animate-pulse"
            >
              <div className="aspect-square w-full bg-slate-100 rounded-xl" />
              <div className="h-5 bg-slate-100 rounded-md w-2/3" />
              <div className="h-4 bg-slate-100 rounded-md w-1/2" />
              <div className="h-10 bg-slate-100 rounded-xl w-full pt-2" />
            </div>
          ))}
        </div>
      ) : rewards.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm space-y-5">
          <div className="w-16 h-16 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Gift className="w-8 h-8 text-slate-400 stroke-[1.5]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-800">
              No rewards found
            </h3>
            <p className="text-sm font-semibold text-slate-400 max-w-xs mx-auto">
              Create your first reward so students can start collecting them.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleCreateClick}
            leftIcon={<Plus className="w-5 h-5" />}
            className="px-6"
          >
            Add Reward
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {rewards.map((reward) => (
            <div key={reward.id}>
              <RewardCard
                reward={reward}
                onEdit={handleEditClick}
                onDelete={handleDeleteReward}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CreateRewardModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveReward}
        goals={goals}
        rewardToEdit={selectedReward}
      />
    </div>
  );
}
