"use client";

import React, { useState, useEffect } from "react";
import {
  useCreateGameWithExercises,
  useGetGameById,
  useGetExercisesByGame,
  useUpdateGameWithExercises,
  useGetExercisesByType,
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
import CrosswordChallengeForm from "./exercises/writing/CrosswordChallengeForm";
import AudioChallengeForm from "./exercises/AudioChallengeForm";
import SpeakingChallengeForm from "./exercises/SpeakingChallengeForm";
import GameProgressWidget from "./GameProgressWidget";
import { ArrowLeft, Save, Sparkles, Plus, Trash2, Copy, X } from "lucide-react";

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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Fetch exercises of the active subtype for importing
  const activeExercise = activeExerciseIndex !== null && exercises[activeExerciseIndex] ? exercises[activeExerciseIndex] : null;
  const activeSubtype = activeExercise ? activeExercise.type : "";
  const { data: libraryExercises = [], isLoading: isLoadingLibrary } = useGetExercisesByType(
    isImportModalOpen ? activeSubtype : ""
  );

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

  const handleDuplicateActiveExercise = () => {
    if (activeExerciseIndex === null) return;
    if (exercises.length >= 8) {
      setAlertConfig({
        visible: true,
        title: "Limit Reached",
        message: "A game can have a maximum of 8 exercises!",
        type: "info",
      });
      return;
    }

    const source = exercises[activeExerciseIndex];
    const clonedContent = JSON.parse(JSON.stringify(source.content));

    const duplicated: TempExercise = {
      name: `${source.name} (Copy)`,
      description: source.description || "",
      type: source.type,
      points_reward: source.points_reward,
      content: clonedContent,
    };

    const updated = [...exercises];
    updated.splice(activeExerciseIndex + 1, 0, duplicated);
    setExercises(updated);
    setActiveExerciseIndex(activeExerciseIndex + 1);
  };

  const handleImportExercise = (sourceExercise: any) => {
    if (activeExerciseIndex === null) return;
    const clonedContent = JSON.parse(JSON.stringify(sourceExercise.content));

    const updated = [...exercises];
    updated[activeExerciseIndex] = {
      ...updated[activeExerciseIndex],
      name: sourceExercise.name,
      description: sourceExercise.description || "",
      points_reward: sourceExercise.points_reward || 10,
      content: clonedContent,
    };
    setExercises(updated);
    setIsImportModalOpen(false);
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

    // 4. Crossword background image
    if (
      tempEx.type === "crossword" &&
      content.backgroundUrl &&
      typeof content.backgroundUrl !== "string"
    ) {
      content.backgroundUrl = await uploadFile(
        content.backgroundUrl,
        "exercise-assets",
      );
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
    if (subtype === "crossword") {
      return (
        <CrosswordChallengeForm
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
            <Sparkles className="w-4 h-4 text-tertiary" />
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

          <GameProgressWidget exercisesCount={exercises.length} />
        </div>

        {/* Column 2: Exercises Manager (6/12 width) */}
        <div className="col-span-1 lg:col-span-9 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800">
                Exercises & Questions ({exercises.length} of 8)
              </h3>
              <div className="flex items-center gap-2">
                {activeExerciseIndex !== null && (
                  <Button
                    variant="secondary"
                    leftIcon={<Copy className="w-3.5 h-3.5" />}
                    onClick={handleDuplicateActiveExercise}
                    className="text-slate-950 font-extrabold text-xs py-2 px-3 rounded-lg border-slate-200 hover:bg-slate-55"
                  >
                    Duplicate Active
                  </Button>
                )}
                <Button
                  variant="secondary"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={handleAddExercise}
                  className="text-slate-950 font-extrabold text-xs py-2 px-3 rounded-lg"
                >
                  Add Exercise
                </Button>
              </div>
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
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
                        Exercise Subtype
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsImportModalOpen(true)}
                        className="text-cyan-600 hover:text-cyan-700 font-extrabold text-[10px] flex items-center gap-1 transition-all uppercase tracking-wider bg-transparent border-0 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-[#24DFE2]" /> Import from Library
                      </button>
                    </div>
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

      {/* Import Exercise Modal */}
      {isImportModalOpen && activeExercise && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-xl relative border border-slate-100 max-h-[85vh] flex flex-col">
            {/* Modal Close */}
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="border-b border-slate-100 pb-4 mb-4">
              <span className="text-[10px] font-black text-[#24DFE2] uppercase tracking-widest">
                Exercise Library
              </span>
              <h3 className="text-lg font-black text-slate-900">
                Import "{getSubtypes(type).find(s => s.value === activeExercise.type)?.label || activeExercise.type}" Exercise
              </h3>
              <p className="text-slate-500 text-xs mt-1 font-medium">
                Select an existing exercise of this subtype from other games to copy its configuration.
              </p>
            </div>

            {/* Modal Content / List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[250px]">
              {isLoadingLibrary ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-550 text-xs font-semibold">
                    Fetching library exercises...
                  </p>
                </div>
              ) : libraryExercises.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                  <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-pulse" />
                  <p className="text-slate-400 text-xs font-semibold">
                    No exercises of this type found in other games yet.
                  </p>
                  <p className="text-slate-350 text-[10px] mt-0.5 font-medium">
                    Exercises will appear here once you create them in other games.
                  </p>
                </div>
              ) : (
                libraryExercises.map((libEx) => (
                  <div
                    key={libEx.id}
                    onClick={() => handleImportExercise(libEx)}
                    className="p-4 border border-slate-200/60 rounded-2xl bg-slate-50/50 hover:bg-slate-50 hover:border-cyan-400 cursor-pointer transition-all duration-200 group text-left"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-black text-slate-800 group-hover:text-cyan-600 transition-colors">
                          {libEx.name}
                        </h4>
                        {libEx.description && (
                          <p className="text-slate-500 text-[10px] mt-0.5 font-medium leading-relaxed">
                            {libEx.description}
                          </p>
                        )}
                        <div className="mt-2 text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                          {libEx.games?.name && (
                            <>
                              <span>Game: {libEx.games.name}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                            </>
                          )}
                          <span>Reward: {libEx.points_reward} pts</span>
                        </div>
                      </div>
                      <div className="shrink-0 bg-white border border-slate-200/50 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider text-slate-400 group-hover:border-cyan-200 group-hover:text-cyan-500 transition-colors">
                        Select
                      </div>
                    </div>

                    {/* Preview of Content */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-450 leading-relaxed font-mono truncate">
                      {getExerciseContentPreview(libEx.type, libEx.content)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 pt-4 mt-4 flex justify-end">
              <Button
                variant="secondary"
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-900 font-extrabold text-xs"
              >
                Close Library
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Generates a clean text preview based on exercise subtype configuration.
 */
function getExerciseContentPreview(type: string, content: any): string {
  if (!content) return "";
  try {
    switch (type) {
      case "match_name_to_picture":
        return `Correct Answer: "${content.correctAnswer || ''}" | Options: ${Array.isArray(content.options) ? content.options.filter(Boolean).join(', ') : ''}`;
      case "identify_picture_reading_name":
        return `Correct Answer: "${content.correctAnswer || ''}" | Options: ${Array.isArray(content.imageOptions) ? content.imageOptions.map((o: any) => o.label).filter(Boolean).join(', ') : ''}`;
      case "match_word":
        return `Items: ${Array.isArray(content.items) ? content.items.map((i: any) => `${i.wordToMatch || ''} (${i.correctAnswer || ''})`).join(', ') : ''}`;
      case "timed_typing_challenge":
        return `Time Limit: ${content.timeLimitSeconds || 30}s | Words: ${Array.isArray(content.words) ? content.words.join(', ') : ''}`;
      case "crossword":
        return `Clues: ${Array.isArray(content.clue) ? content.clue.map((c: any) => c.text).join(', ') : ''}`;
      case "match_audio_to_text":
        return `Items: ${Array.isArray(content.items) ? content.items.map((i: any) => `${i.phrase || ''} (${i.answer || ''})`).join(', ') : ''}`;
      case "identify_audio":
      case "fast_audio_mode":
        return `Correct Answer: "${content.correctAnswer || ''}" | Options: ${Array.isArray(content.options) ? content.options.filter(Boolean).join(', ') : ''}`;
      case "speak_before_timer":
        return `Phrase: "${content.phraseToSpeak || ''}" | Time: ${content.durationSeconds || 15}s`;
      case "say_5_words_quickly":
        return `Words: ${Array.isArray(content.words) ? content.words.filter(Boolean).join(', ') : ''}`;
      case "tongue_twister_challenge":
        return `Tongue Twister: "${content.tongueTwister || ''}" | Attempts: ${content.maxAttempts || 3}`;
      default:
        return "";
    }
  } catch (e) {
    return "Error parsing content preview";
  }
}

