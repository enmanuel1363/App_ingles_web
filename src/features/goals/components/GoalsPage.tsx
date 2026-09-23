"use client";

import React, { useState } from "react";
import { Plus, Target, RefreshCw, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { useGoals } from "../hooks/useGoals";
import GoalCard from "./GoalCard";
import CreateGoalModal from "./CreateGoalModal";
import { GoalWithReward, CreateGoalDTO } from "../goals.types";
import { useModal } from "@/components/ui/ModalProvider";

export default function GoalsPage() {
  const {
    goals,
    isLoading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    refreshGoals,
  } = useGoals();
  const { showAlert } = useModal();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalWithReward | null>(null);

  const handleEditClick = (goal: GoalWithReward) => {
    setSelectedGoal(goal);
    setModalVisible(true);
  };

  const handleCreateClick = () => {
    setSelectedGoal(null);
    setModalVisible(true);
  };

  const handleSaveGoal = async (
    goalData: CreateGoalDTO,
    rewardId?: string,
  ): Promise<boolean> => {
    if (selectedGoal) {
      // Edit
      const res = await updateGoal(selectedGoal.id, goalData, rewardId);
      if (res.success) {
        showAlert({
          title: "Goal saved",
          message: "The goal has been updated successfully.",
          type: "success",
        });
        return true;
      } else {
        showAlert({
          title: "Error",
          message: `Error updating goal: ${res.error}`,
          type: "error",
        });
        return false;
      }
    } else {
      // Create
      const res = await createGoal(goalData, rewardId);
      if (res.success) {
        showAlert({
          title: "Goal created",
          message: "The goal has been created successfully.",
          type: "success",
        });
        return true;
      } else {
        showAlert({
          title: "Error",
          message: `Error creating goal: ${res.error}`,
          type: "error",
        });
        return false;
      }
    }
  };

  const handleDeleteGoal = async (id: string) => {
    const res = await deleteGoal(id);
    if (!res.success) {
      showAlert({
        title: "Error",
        message: `Error deleting goal: ${res.error}`,
        type: "error",
      });
    } else {
      showAlert({
        title: "Goal deleted",
        message: "The goal has been deleted successfully.",
        type: "success",
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      {/* Top Header Card */}
      <div className="border-b border-slate-200/80 p-2 md:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            Learning Goals
          </h1>
          <p className="text-sm font-semibold text-slate-500">
            Define milestones and targets that will motivate your students' daily progress.
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            variant="outlined"
            onClick={refreshGoals}
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
            New Goal
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
              onClick={refreshGoals}
              className="mt-3.5 text-xs py-2 bg-white text-rose-700 border-rose-200 hover:bg-rose-100/50"
            >
              Try again
            </Button>
          </div>
        </div>
      )}

      {/* Content grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm animate-pulse"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-xl" />
              <div className="h-5 bg-slate-100 rounded-md w-2/3" />
              <div className="h-12 bg-slate-100 rounded-xl w-full" />
              <div className="h-10 bg-slate-100 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm space-y-5">
          <div className="w-16 h-16 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Target className="w-8 h-8 text-slate-400 stroke-[1.5]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-800">
              No goals found
            </h3>
            <p className="text-sm font-semibold text-slate-400 max-w-xs mx-auto">
              Define your first academic goal to associate rewards and motivate your students.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleCreateClick}
            leftIcon={<Plus className="w-5 h-5" />}
            className="px-6"
          >
            New Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <div key={goal.id}>
              <GoalCard
                goal={goal}
                onEdit={handleEditClick}
                onDelete={handleDeleteGoal}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CreateGoalModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveGoal}
        goalToEdit={selectedGoal}
      />
    </div>
  );
}
