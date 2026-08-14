"use client";

import React, { useState, useEffect } from "react";
import {
  useCreateGameWithExercises,
  useGetGameById,
  useGetExercisesByGame,
  useUpdateGameWithExercises,
} from "../hooks/useGames";
import { GameType } from "../games.types";
import { getDefaultContentSchema, getSubtypes } from "../games.constants";
import { uploadFile } from "@/features/exercises/services/storage.service";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import AlertModal from "@/components/ui/AlertModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import MatchNameToPictureForm from "./exercises/writing/MatchNameToPictureForm";
import IdentifyPictureReadingNameForm from "./exercises/writing/IdentifyPictureReadingNameForm";
import TimedTypingChallengeForm from "./exercises/writing/TimedTypingChallengeForm";
import MatchWordChallengeForm from "./exercises/writing/MatchWordChallengeForm";
import AudioChallengeForm from "./exercises/AudioChallengeForm";
import SpeakingChallengeForm from "./exercises/SpeakingChallengeForm";
import GameProgressWidget from "./GameProgressWidget";
import { ArrowLeft, Save, Sparkles, Plus, Trash2 } from "lucide-react";

interface GameCreatorProps {
  teacherId: string;
  onClose: () => void;
  editingGameId?: string;
}

interface TempExercise {
  name: string;
  description: string;
  type: string;
  points_reward: number;
  content: any;
}

export default function GameCreator({
  teacherId,
  onClose,
  editingGameId,
}: GameCreatorProps) {
  const createGameMutation = useCreateGameWithExercises();
  const updateGameMutation = useUpdateGameWithExercises();

  // Fetch existing game & exercises if editingGameId is present
  const { data: existingGame, isLoading: isLoadingGame } = useGetGameById(
    editingGameId || "",
  );
  const { data: existingExercises, isLoading: isLoadingExercises } =
    useGetExercisesByGame(editingGameId || "");

  // Form State: Game Header
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<GameType>("write");

  // Form State: Exercises list (up to 8)
  const [exercises, setExercises] = useState<TempExercise[]>([]);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);

  // Modal states
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title?: string;
    message: string;
    type?: "success" | "error" | "info";
    onClose?: () => void;
  }>({ visible: false, message: "" });

  const [confirmConfig, setConfirmConfig] = useState<{
    visible: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "primary" | "secondary";
    onConfirm: () => void;
  }>({
    visible: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Load data for editing
  useEffect(() => {
    if (editingGameId && existingGame) {
      setName(existingGame.name);
      setDescription(existingGame.description || "");
      setType(existingGame.type);
    }
  }, [editingGameId, existingGame]);

  useEffect(() => {
    if (editingGameId && existingExercises && existingExercises.length > 0) {
      const mappedExercises = existingExercises.map((ex) => ({
        name: ex.name,
        description: ex.description || "",
        type: ex.type,
        points_reward: ex.points_reward,
        content: ex.content,
      }));
      setExercises(mappedExercises);
      setActiveExerciseIndex(0);
    }
  }, [editingGameId, existingExercises]);

  const handleAddExercise = () => {
    if (exercises.length >= 8) {
      setAlertConfig({
        visible: true,
        title: "Limit Reached",
        message: "A game can have a maximum of 8 exercises!",
        type: "info",
      });
      return;
    }

    const availableSubtypes = getSubtypes(type);
    const defaultSubtype =
      availableSubtypes[0]?.value || "match_name_to_picture";
    const initialContent = getDefaultContentSchema(defaultSubtype);

    const newExercise: TempExercise = {
      name: `Exercise ${exercises.length + 1}`,
      description: "",
      type: defaultSubtype,
      points_reward: 10,
      content: initialContent,
    };

    setExercises([...exercises, newExercise]);
    setActiveExerciseIndex(exercises.length);
  };

  const handleRemoveExercise = (index: number) => {
    const updated = exercises.filter((_, i) => i !== index);
    setExercises(updated);
    if (activeExerciseIndex === index) {
      setActiveExerciseIndex(updated.length > 0 ? 0 : null);
    } else if (activeExerciseIndex !== null && activeExerciseIndex > index) {
      setActiveExerciseIndex(activeExerciseIndex - 1);
    }
  };

  const updateExerciseField = (
    index: number,
    field: keyof TempExercise,
    value: any,
  ) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "type") {
      updated[index].content = getDefaultContentSchema(value);
    }

    setExercises(updated);
  };

  // Upload local File assets to Supabase Storage and get public URLs
  const uploadExerciseAssets = async (tempEx: TempExercise): Promise<any> => {
    const content = { ...tempEx.content };

    // 1. match_name_to_picture image
    if (
      tempEx.type === "match_name_to_picture" &&
      content.imageUrl &&
      typeof content.imageUrl !== "string"
    ) {
      content.imageUrl = await uploadFile(content.imageUrl, "exercise-assets");
    }

    // 2. identify_picture_reading_name image options array
    if (
      tempEx.type === "identify_picture_reading_name" &&
      Array.isArray(content.imageOptions)
    ) {
      content.imageOptions = await Promise.all(
        content.imageOptions.map(async (opt: any) => {
          if (opt.url && typeof opt.url !== "string") {
            const url = await uploadFile(opt.url, "exercise-assets");
            return { ...opt, url };
          }
          return opt;
        }),
      );
    }

    // 3. Audio URLs for listening challenges
    if (
      (tempEx.type === "fast_audio_mode" || tempEx.type === "identify_audio") &&
      content.audioUrl &&
      typeof content.audioUrl !== "string"
    ) {
      content.audioUrl = await uploadFile(content.audioUrl, "exercise-audios");
    }



    return content;
  };

  const handleSaveGame = async () => {
    if (!name.trim()) {
      setAlertConfig({
        visible: true,
        title: "Validation Error",
        message: "Please enter a name for the game.",
        type: "info",
      });
      return;
    }
    if (exercises.length === 0) {
      setAlertConfig({
        visible: true,
        title: "Validation Error",
        message: "Please add at least one exercise to the game.",
        type: "info",
      });
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload files first
      const processedExercises = await Promise.all(
        exercises.map(async (ex, idx) => {
          const content = await uploadExerciseAssets(ex);
          return {
            name: ex.name,
            description: ex.description || null,
            type: ex.type,
            content,
            order_index: idx,
            points_reward: ex.points_reward,
          };
        }),
      );

      // 2. Submit schema insertion or update
      const gameDTO = {
        name,
        description: description || null,
        type,
        created_by: teacherId,
        is_active: true,
      };

      if (editingGameId) {
        updateGameMutation.mutate(
          {
            gameId: editingGameId,
            game: gameDTO,
            exercises: processedExercises,
          },
          {
            onSuccess: () => {
              setAlertConfig({
                visible: true,
                title: "Success",
                message: "Game successfully updated!",
                type: "success",
                onClose: onClose,
              });
            },
            onError: () => {
              setIsUploading(false);
            },
          },
        );
      } else {
        createGameMutation.mutate(
          { game: gameDTO, exercises: processedExercises },
          {
            onSuccess: () => {
              setAlertConfig({
                visible: true,
                title: "Success",
                message: "Game successfully created and published!",
                type: "success",
                onClose: onClose,
              });
            },
            onError: () => {
              setIsUploading(false);
            },
          },
        );
      }
    } catch (err) {
      console.error("Asset upload failure:", err);
      setAlertConfig({
        visible: true,
        title: "Upload Error",
        message:
          "Failed to upload local images/audio to storage. Check connections.",
        type: "error",
      });
      setIsUploading(false);
    }
  };

  function renderSubtypeFormInputs(exercise: TempExercise, idx: number) {
    const { type: subtype, content } = exercise;

    const onChangeContent = (updatedContent: any) => {
      updateExerciseField(idx, "content", updatedContent);
    };

    if (subtype === "match_name_to_picture") {
      return (
        <MatchNameToPictureForm
          content={content}
          onChangeContent={onChangeContent}
        />
      );
    }
    if (subtype === "identify_picture_reading_name") {
      return (
        <IdentifyPictureReadingNameForm
          content={content}
          onChangeContent={onChangeContent}
        />
      );
    }
    if (subtype === "match_word") {
      return (
        <MatchWordChallengeForm
          content={content}
          onChangeContent={onChangeContent}
        />
      );
    }
    if (subtype === "timed_typing_challenge") {
      return (
        <TimedTypingChallengeForm
          content={content}
          onChangeContent={onChangeContent}
        />
      );
    }
    if (
      subtype === "match_audio_to_text" ||
      subtype === "identify_audio" ||
      subtype === "fast_audio_mode"
    ) {
      return (
        <AudioChallengeForm
          subtype={subtype}
          content={content}
          onChangeContent={onChangeContent}
        />
      );
    }
    // Speaking challenges
    return (
      <SpeakingChallengeForm
        subtype={subtype}
        content={content}
        onChangeContent={onChangeContent}
      />
    );
  }

  if (editingGameId && (isLoadingGame || isLoadingExercises)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fffcf2]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm font-semibold">
            Loading game details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-8 bg-[#fffcf2] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full border border-slate-200 text-slate-500 hover:text-slate-800 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-black text-[#24DFE2] uppercase tracking-widest">
              Builder Arena
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {editingGameId
                ? "Edit Interactive Game"
                : "Create Interactive Game"}
            </h1>
          </div>
        </div>

        <Button
          variant="primary"
          leftIcon={<Save className="w-4 h-4" />}
          isLoading={
            createGameMutation.isPending ||
            updateGameMutation.isPending ||
            isUploading
          }
          onClick={handleSaveGame}
          className="text-slate-950 font-black px-6"
        >
          {isUploading
            ? "Uploading Assets..."
            : editingGameId
              ? "Save Game"
              : "Publish Game"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Column 1: Game details (3/12 width) */}
        <div className="col-span-1 lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6 self-start">
          <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FF9400]" />
            Game Configuration
          </h3>

          <FormInput
            label="Game Name"
            placeholder="e.g. Daily Vocabulary Challenge"
            value={name}
            onChangeText={setName}
          />

          <FormInput
            label="Game Description"
            placeholder="e.g. Practice daily objects vocabulary..."
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <div className="space-y-1.5 w-full">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
              Main Challenge Type
            </label>
            <select
              value={type}
              onChange={(e) => {
                const newType = e.target.value as GameType;
                if (newType !== type) {
                  if (exercises.length > 0) {
                    setConfirmConfig({
                      visible: true,
                      title: "Change Challenge Type",
                      description:
                        "Changing the main challenge type will clear all current exercises. Do you want to proceed?",
                      confirmText: "Change",
                      cancelText: "Cancel",
                      variant: "danger",
                      onConfirm: () => {
                        setType(newType);
                        setExercises([]);
                        setActiveExerciseIndex(null);
                      },
                    });
                  } else {
                    setType(newType);
                  }
                }
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-xs font-semibold"
            >
              <option value="write">Written Challenges (Writing)</option>
              <option value="listen">Listening Challenges (Audio)</option>
              <option value="speak">Speaking Challenges (Microphone)</option>
              <option value="mix">Mixed Arena (All combined)</option>
            </select>
          </div>
        </div>

        {/* Column 2: Exercises Manager (6/12 width) */}
        <div className="col-span-1 lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800">
                Exercises & Questions ({exercises.length} of 8)
              </h3>
              <Button
                variant="secondary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleAddExercise}
                className="text-slate-950 font-extrabold text-xs py-2 px-3 rounded-lg"
              >
                Add Exercise
              </Button>
            </div>

            {exercises.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-slate-400 text-xs font-semibold">
                  No exercises added yet. Click "Add Exercise" above to get
                  started.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mb-4">
                {exercises.map((ex, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveExerciseIndex(index)}
                    className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                      activeExerciseIndex === index
                        ? "bg-[#24DFE2] text-slate-950 font-black shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/50"
                    }`}
                  >
                    <span>
                      {index + 1}. {ex.name || `Ex ${index + 1}`}
                    </span>
                    <Trash2
                      className="w-3.5 h-3.5 hover:text-rose-500 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveExercise(index);
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Exercise Form Details */}
            {activeExerciseIndex !== null && exercises[activeExerciseIndex] && (
              <div className="border-t border-slate-100 pt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Exercise Title"
                    value={exercises[activeExerciseIndex].name}
                    onChangeText={(val) =>
                      updateExerciseField(activeExerciseIndex, "name", val)
                    }
                  />

                  <div className="space-y-1.5 w-full">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
                      Exercise Subtype
                    </label>
                    <select
                      value={exercises[activeExerciseIndex].type}
                      onChange={(e) =>
                        updateExerciseField(
                          activeExerciseIndex,
                          "type",
                          e.target.value,
                        )
                      }
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-sm font-semibold"
                    >
                      {getSubtypes(type).map((sub) => (
                        <option key={sub.value} value={sub.value}>
                          {sub.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Subtype Instructions / Description"
                    placeholder="e.g. Select the image that fits..."
                    value={exercises[activeExerciseIndex].description}
                    onChangeText={(val) =>
                      updateExerciseField(
                        activeExerciseIndex,
                        "description",
                        val,
                      )
                    }
                  />
                  <div className="space-y-1.5 w-full">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
                      Reward Points
                    </label>
                    <input
                      type="number"
                      value={exercises[activeExerciseIndex].points_reward}
                      onChange={(e) =>
                        updateExerciseField(
                          activeExerciseIndex,
                          "points_reward",
                          Number(e.target.value),
                        )
                      }
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-sm font-semibold"
                    />
                  </div>
                </div>

                {/* Subtype Specific fields */}
                <div className="bg-[#fffcf2] border border-slate-200/60 rounded-2xl p-6 space-y-4">
                  <h4 className="text-xs font-black text-slate-700 tracking-wider uppercase border-b border-slate-200 pb-2">
                    Exercise Content Configuration
                  </h4>

                  {renderSubtypeFormInputs(
                    exercises[activeExerciseIndex],
                    activeExerciseIndex,
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Progress Tracker Widget (3/12 width) - Pinned/Sticky */}
        <div className="col-span-1 lg:col-span-3 lg:sticky lg:top-6 self-start">
          <GameProgressWidget exercisesCount={exercises.length} />
        </div>
      </div>

      {/* Custom Alert & Confirmation Modals */}
      <AlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => {
          setAlertConfig((prev) => ({ ...prev, visible: false }));
          if (alertConfig.onClose) alertConfig.onClose();
        }}
      />

      <ConfirmationModal
        visible={confirmConfig.visible}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        variant={confirmConfig.variant}
        onConfirm={() => {
          setConfirmConfig((prev) => ({ ...prev, visible: false }));
          confirmConfig.onConfirm();
        }}
        onClose={() =>
          setConfirmConfig((prev) => ({ ...prev, visible: false }))
        }
      />
    </div>
  );
}
