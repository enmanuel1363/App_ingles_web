"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, ImagePlus, Trash2, Plus, Save } from "lucide-react";
import FormInput from "@/components/ui/FormInput";
import Button from "@/components/ui/Button";
import { Goal, RewardWithGoal, RewardType } from "../rewards.types";
import { useModal } from "@/components/ui/ModalProvider";

interface CreateRewardModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (reward: any, file?: File) => Promise<boolean>;
  goals: Goal[];
  rewardToEdit?: RewardWithGoal | null;
}

export default function CreateRewardModal({
  visible,
  onClose,
  onSave,
  goals,
  rewardToEdit,
}: CreateRewardModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<RewardType>("gif");
  const [idGoal, setIdGoal] = useState<string>("");
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up local Object URL previews to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const { showAlert } = useModal();

  useEffect(() => {
    if (rewardToEdit) {
      setName(rewardToEdit.name);
      setType(rewardToEdit.type);
      setIdGoal(rewardToEdit.id_goal || "");
      setLocalFile(null);
      setPreviewUrl(rewardToEdit.url || "");
    } else {
      setName("");
      setType("gif");
      setIdGoal("");
      setLocalFile(null);
      setPreviewUrl("");
    }
  }, [rewardToEdit, visible]);

  if (!visible) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setLocalFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleRemoveLocalFile = () => {
    setLocalFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
    if (!previewUrl) {
      showAlert({
        title: "Image Required",
        message: "You must select an image or GIF.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const rewardData = {
        name,
        type,
        id_goal: idGoal || null,
        url: localFile ? "" : (rewardToEdit?.url || ""),
      };

      const success = await onSave(rewardData, localFile || undefined);
      if (success) {
        handleClose();
      }
    } catch (err) {
      console.error(err);
      showAlert({
        title: "Error",
        message: "An error occurred while saving the reward.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setType("gif");
    setIdGoal("");
    setLocalFile(null);
    setPreviewUrl("");
    onClose();
  };

  const isEdit = !!rewardToEdit;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl bg-white border border-slate-200/80 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 relative animate-scale-up text-slate-800 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {isEdit ? "Edit Reward" : "New Reward"}
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-all duration-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Form Fields */}
            <div className="space-y-4">
              <FormInput
                label="Reward Name"
                placeholder="e.g. Glowing Star Sticker"
                value={name}
                onChangeText={setName}
              />

              {/* Type Select */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Reward Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as RewardType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-850 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary-dark transition-all duration-200"
                >
                  <option value="gif">Animated GIF</option>
                  <option value="sticker">Sticker (Static image)</option>
                </select>
              </div>

              {/* Goal Select */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Associate with a Goal (Optional)
                </label>
                <select
                  value={idGoal}
                  onChange={(e) => setIdGoal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-850 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary-dark transition-all duration-200"
                >
                  <option value="">None (Globally available)</option>
                  {goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.name} ({goal.type})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Rewards associated with a goal are unlocked when the student completes it.
                </span>
              </div>
            </div>

            {/* Right Column: Media / File Selection */}
            <div className="space-y-4 flex flex-col justify-center">
              <div className="flex flex-col space-y-1.5 mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Reward Image or GIF
                </label>
              </div>

              {/* File Upload Area */}
              {previewUrl ? (
                <div className="relative aspect-square w-full max-w-[200px] mx-auto rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center group shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="object-contain w-full h-full p-3 group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  <button
                    type="button"
                    className="absolute top-2.5 right-2.5 bg-rose-500 hover:bg-rose-600 text-white p-2 rounded-xl transition-colors cursor-pointer shadow-lg z-10"
                    onClick={handleRemoveLocalFile}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full aspect-video rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary bg-slate-50/50 hover:bg-slate-50/80 flex flex-col justify-center items-center cursor-pointer transition-all duration-300 group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex justify-center items-center mb-2.5 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-200">
                    <ImagePlus className="w-5 h-5 text-primary-dark" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                    Select image or GIF
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 font-semibold">
                    PNG, JPG, SVG or GIF
                  </span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-row-reverse gap-3.5 pt-4 border-t border-slate-100">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={isEdit ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              className="min-w-[140px]"
            >
              {isEdit ? "Save Changes" : "Create Reward"}
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
