"use client";

import React, { useEffect, useState } from "react";
import { X, Plus, Save } from "lucide-react";
import FormInput from "@/components/ui/FormInput";
import Button from "@/components/ui/Button";
import { GoalWithReward, GoalType, Reward } from "../goals.types";
import { goalsService } from "../services/goals.service";
import { DEFAULT_GOAL_VALIDATIONS } from "../goals.constants";
import { useModal } from "@/components/ui/ModalProvider";

interface CreateGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (goal: any, rewardId?: string) => Promise<boolean>;
  goalToEdit?: GoalWithReward | null;
}

const GOAL_TYPES: { value: GoalType; label: string }[] = [
  { value: "points", label: "Experience Points (XP)" },
  { value: "lesson", label: "Completed Lesson" },
  { value: "time", label: "Record Time (seconds)" },
  { value: "classes", label: "Completed Course" },
  { value: "streak", label: "Active Streak Days" },
  { value: "approvals", label: "Approved Lessons (accumulated)" },
  { value: "collection", label: "Reward Collection" },
  { value: "ranking", label: "League Rank (Top N)" },
];

export default function CreateGoalModal({
  visible,
  onClose,
  onSave,
  goalToEdit,
}: CreateGoalModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<GoalType>("points");
  const [target, setTarget] = useState<number | string>(100);
  const [rewardId, setRewardId] = useState<string>("");
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([]);
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert } = useModal();

  // Cargar cursos y clases para catálogos
  useEffect(() => {
    if (!visible) return;
    async function loadCatalogs() {
      try {
        const [coursesData, classesData] = await Promise.all([
          goalsService.getCourses(),
          goalsService.getClasses(),
        ]);
        setCourses(coursesData);
        setClasses(classesData);
      } catch (err) {
        console.error("Error loading courses or classes:", err);
      }
    }
    loadCatalogs();
  }, [visible]);

  // Cargar recompensas disponibles
  useEffect(() => {
    if (!visible) return;

    async function loadRewards() {
      setIsLoadingRewards(true);
      try {
        const rewards = await goalsService.getAvailableRewards(goalToEdit?.id);
        setAvailableRewards(rewards);
      } catch (err) {
        console.error("Error loading rewards for goals:", err);
      } finally {
        setIsLoadingRewards(false);
      }
    }

    loadRewards();
  }, [goalToEdit, visible]);

  // Rellenar datos si es edición
  useEffect(() => {
    if (goalToEdit) {
      setName(goalToEdit.name);
      setDescription(goalToEdit.description || "");
      setType(goalToEdit.type);
      setRewardId(goalToEdit.reward?.id || "");

      const validationVal = goalToEdit.validation as any;
      // Extraer usando el tipo dinámico
      const targetValue =
        validationVal?.[goalToEdit.type] !== undefined
          ? validationVal[goalToEdit.type]
          : validationVal?.target || 100;
      setTarget(targetValue);
    } else {
      setName("");
      setDescription("");
      setType("points");
      setTarget(100);
      setRewardId("");
    }
  }, [goalToEdit, visible]);

  if (!visible) return null;

  const handleTypeChange = (newType: GoalType) => {
    setType(newType);
    if (!goalToEdit) {
      const defaultVal = DEFAULT_GOAL_VALIDATIONS[newType];
      if (defaultVal) {
        setTarget(defaultVal[newType] || 100);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showAlert({
        title: "Required Field",
        message: "Name is required.",
        type: "error",
      });
      return;
    }

    const isStringType = type === "lesson" || type === "classes";
    if (isStringType && !target) {
      showAlert({
        title: "Selection Required",
        message: `You must select the required ${type === "lesson" ? "lesson" : "course"}.`,
        type: "error",
      });
      return;
    }
    if (!isStringType && (typeof target !== "number" || target <= 0)) {
      showAlert({
        title: "Invalid Value",
        message: "The numeric target must be greater than zero.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const goalData = {
        name,
        description: description.trim() || null,
        type,
        validation: { [type]: target },
      };

      const success = await onSave(goalData, rewardId || undefined);
      if (success) {
        handleClose();
      }
    } catch (err) {
      console.error(err);
      showAlert({
        title: "Error",
        message: "An error occurred while saving the goal.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setType("points");
    setTarget(100);
    setRewardId("");
    onClose();
  };

  const isEdit = !!goalToEdit;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl bg-white border border-slate-200/80 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 relative animate-scale-up text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {isEdit ? "Edit Goal" : "New Goal"}
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-650 p-1.5 rounded-lg hover:bg-slate-50 transition-all duration-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <FormInput
            label="Goal Name"
            placeholder="e.g. Weekly Consistency"
            value={name}
            onChangeText={setName}
          />

          <FormInput
            label="Description"
            placeholder="e.g. Complete one lesson per day for 7 consecutive days."
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type Dropdown */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
                Goal Type
              </label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value as GoalType)}
                className="w-full bg-slate-50 border border-slate-205 rounded-xl px-4 py-3 font-semibold text-slate-850 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary-dark transition-all duration-200"
              >
                {GOAL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Value Input */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
                {type === "time"
                  ? "Record Time in Game (Seconds)"
                  : type === "lesson"
                    ? "Select Lesson"
                    : type === "classes"
                      ? "Select Course"
                      : type === "approvals"
                        ? "Lessons to Pass"
                        : type === "collection"
                          ? "Rewards to Collect"
                          : type === "ranking"
                            ? "Highest League Rank (Top N)"
                            : "Required Target"}
              </label>
              {type === "lesson" ? (
                <select
                  value={target.toString()}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 rounded-xl px-4 py-3 font-semibold text-slate-850 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary-dark transition-all duration-200"
                >
                  <option value="">Select a lesson...</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              ) : type === "classes" ? (
                <select
                  value={target.toString()}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 rounded-xl px-4 py-3 font-semibold text-slate-850 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary-dark transition-all duration-200"
                >
                  <option value="">Select a course...</option>
                  {courses.map((crs) => (
                    <option key={crs.id} value={crs.id}>
                      {crs.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  min={1}
                  value={typeof target === "number" ? target : 0}
                  onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-205 rounded-xl px-4 py-3 font-semibold text-slate-850 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary-dark transition-all duration-200"
                />
              )}
              {type === "time" && (
                <span className="text-[9px] text-slate-400 font-bold leading-none mt-1">
                  Maximum allowed time to complete the lesson.
                </span>
              )}
            </div>
          </div>

          {/* Reward Dropdown */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
              Reward to Grant (Optional)
            </label>
            <select
              value={rewardId}
              onChange={(e) => setRewardId(e.target.value)}
              disabled={isLoadingRewards}
              className="w-full bg-slate-50 border border-slate-205 rounded-xl px-4 py-3 font-semibold text-slate-850 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary-dark transition-all duration-200 disabled:opacity-50"
            >
              <option value="">
                No Reward (Achievement unlocked without item)
              </option>
              {availableRewards.map((reward) => (
                <option key={reward.id} value={reward.id}>
                  {reward.name} ({reward.type})
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              Unassigned rewards can be linked to a single goal.
            </span>
          </div>

          {/* Action Footer */}
          <div className="flex flex-row-reverse gap-3.5 pt-4 border-t border-slate-100">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={
                isEdit ? (
                  <Save className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )
              }
              className="min-w-[140px]"
            >
              {isEdit ? "Save Changes" : "Create Goal"}
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
