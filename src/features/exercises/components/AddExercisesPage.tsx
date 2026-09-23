"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CreateExercise from "./CreateExercise";
import {
  EXERCISE_CATEGORIES,
  EXERCISE_DEFAULT_CONTENT,
  EXERCISE_DEFAULT_DESCRIPTIONS,
} from "../exercise-constants";
import { useCreateExercises, useGetExercises } from "../hooks/useExercises";
import { useExerciseStore } from "../hooks/useExerciseStore";
import { sanitizeData } from "../utils/sanitize";
import {
  deleteExercises,
  processExerciseFiles,
} from "../services/storage.service";
import {
  ArrowLeft,
  AlertCircle,
  Plus,
  Save,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useModal } from "@/components/ui/ModalProvider";

type Props = {
  classId: string;
};

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function AddExercisesPage({ classId }: Props) {
  const router = useRouter();
  const { showAlert, confirm } = useModal();
  const {
    data,
    collision,
    drafts,
    resolveCollisionUseDraft,
    resolveCollisionUseServer,
    addExercise,
    removeExercise,
    initializeExercises,
    clearDraft,
    discardDraft,
    moveUp,
    moveDown,
    reorderExercises,
  } = useExerciseStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (draggedIndex === null) return;

    let latestClientY: number | null = null;
    let rafId: number;

    const findScrollContainer = (): HTMLElement | Window => {
      const main = document.querySelector("main");
      if (main && main.scrollHeight > main.clientHeight) return main;
      return window;
    };

    const getScrollBounds = (container: HTMLElement | Window) => {
      if (container === window) {
        return { top: 0, bottom: window.innerHeight };
      }
      const rect = (container as HTMLElement).getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom };
    };

    const doScroll = (container: HTMLElement | Window, amount: number) => {
      if (container === window) {
        window.scrollBy(0, amount);
      } else {
        (container as HTMLElement).scrollTop += amount;
      }
    };

    const threshold = 140; // px desde el borde donde empieza a desplazarse
    const maxSpeed = 18; // velocidad máxima, al borde mismo

    const tick = () => {
      if (latestClientY !== null) {
        const container = findScrollContainer();
        const { top, bottom } = getScrollBounds(container);

        const distanceFromTop = latestClientY - top;
        const distanceFromBottom = bottom - latestClientY;

        if (distanceFromTop >= 0 && distanceFromTop < threshold) {
          // Entre más cerca del borde, más rápido (aceleración suave)
          const intensity = 1 - distanceFromTop / threshold;
          doScroll(container, -maxSpeed * intensity);
        } else if (distanceFromBottom >= 0 && distanceFromBottom < threshold) {
          const intensity = 1 - distanceFromBottom / threshold;
          doScroll(container, maxSpeed * intensity);
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    const handleWindowDragOver = (e: DragEvent) => {
      latestClientY = e.clientY;
    };

    window.addEventListener("dragover", handleWindowDragOver);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
      cancelAnimationFrame(rafId);
    };
  }, [draggedIndex]);

  const { data: existingExercises, isLoading: isLoadingExercises } =
    useGetExercises(classId);
  const { mutateAsync: createExercises, isPending } = useCreateExercises();

  useEffect(() => {
    if (existingExercises === undefined) return;
    initializeExercises(classId, existingExercises);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, existingExercises]);

  // Calculate realtime category requirements (Count of exercises, not items)
  const categoryCounts = {
    Introduction: 0,
    Validation: 0,
  };
  data.forEach((ex) => {
    const cat = EXERCISE_CATEGORIES[ex.type];
    if (cat === "Introduction" || cat === "Validation") {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
  });

  const introValid = categoryCounts["Introduction"] >= 1;
  const valValid = categoryCounts["Validation"] >= 3;
  const totalValid = data.length <= 15;
  const hasDraft = drafts && !!drafts[classId];

  const handleAddAnother = () => {
    if (data.length >= 15) {
      setFormError("Maximum of 15 exercises allowed in total.");
      return;
    }
    addExercise({
      id_class: classId,
      name: "",
      description: EXERCISE_DEFAULT_DESCRIPTIONS["complete_word"] || "",
      type: "complete_word",
      content: EXERCISE_DEFAULT_CONTENT["complete_word"],
      order_index: data.length,
    });
  };

  const handleRemove = (index: number) => {
    if (data.length <= 1) return;

    const removedCat = EXERCISE_CATEGORIES[data[index].type];
    removeExercise(index);

    // Calculate validation on the fly to show a friendly warning
    const countsAfter = {
      Introduction: 0,
      Validation: 0,
    };
    data.forEach((ex, i) => {
      if (i === index) return;
      const cat = EXERCISE_CATEGORIES[ex.type];
      if (cat === "Introduction" || cat === "Validation") {
        countsAfter[cat] = (countsAfter[cat] || 0) + 1;
      }
    });

    if (removedCat === "Introduction" && countsAfter["Introduction"] < 1) {
      setFormError(
        "Remember that you need a minimum of 1 Introduction exercise to save.",
      );
    } else if (removedCat === "Validation" && countsAfter["Validation"] < 3) {
      setFormError(
        "Remember that you need a minimum of 3 Validation exercises to save.",
      );
    } else {
      setFormError(null);
    }
  };

  const handleDiscardDraft = async () => {
    const isConfirmed = await confirm({
      title: "Discard local draft?",
      description:
        "This action will permanently delete your unsaved local changes and load the server configuration. Do you want to continue?",
      confirmText: "Yes, discard",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (isConfirmed) {
      discardDraft(classId, existingExercises || []);
      await showAlert({
        title: "Draft discarded",
        message:
          "The draft has been discarded and the server content has been loaded.",
        type: "success",
      });
    }
  };

  const handleSaveAll = async () => {
    setFormError(null);

    const sanitizedData = data.map((ex) => sanitizeData(ex));

    const invalid = sanitizedData.some((ex) => !ex.name || ex.name.length < 3);
    if (invalid) {
      setFormError("Please complete the names of all exercises.");
      return;
    }

    // Validate that exercises are complete and do not have empty items/fields
    for (let i = 0; i < sanitizedData.length; i++) {
      const ex = sanitizedData[i];
      const items = ex.content?.items || [];

      // If it's a placeholder, skip
      if (ex.type === "placeholder") continue;

      if (items.length === 0) {
        setFormError(
          `Exercise #${i + 1} (${ex.name || "Untitled"}) has no items.`,
        );
        return;
      }

      for (let j = 0; j < items.length; j++) {
        const item = items[j];

        if (ex.type === "complete_word") {
          const hasCorrect =
            item.correct_answer && item.correct_answer.trim() !== "";
          const hasPossibles =
            item.possible_answers && item.possible_answers.length > 0;
          if (!hasCorrect || !hasPossibles) {
            setFormError(
              `Exercise #${i + 1} (${ex.name || "Untitled"}) has item #${j + 1} incomplete. It must have a correct answer and possible answers.`,
            );
            return;
          }
        } else if (ex.type === "reading_quiz") {
          const hasPhrase = item.phrase && item.phrase.trim() !== "";
          const hasQuestions = item.questions && item.questions.length > 0;
          if (!hasPhrase) {
            setFormError(
              `Exercise #${i + 1} (${ex.name || "Untitled"}) must have a phrase or reading text.`,
            );
            return;
          }
          if (!hasQuestions) {
            setFormError(
              `Exercise #${i + 1} (${ex.name || "Untitled"}) must have at least one question.`,
            );
            return;
          }
          for (let q = 0; q < item.questions.length; q++) {
            const qItem = item.questions[q];
            const hasQText = qItem.question && qItem.question.trim() !== "";
            const hasCorrect =
              qItem.correct_answer && qItem.correct_answer.trim() !== "";
            const hasPossibles =
              qItem.possible_answers && qItem.possible_answers.length > 0;
            if (!hasQText || !hasCorrect || !hasPossibles) {
              setFormError(
                `Exercise #${i + 1} (${ex.name || "Untitled"}) has question #${q + 1} incomplete. It must have a question, correct answer, and at least one possible answer.`,
              );
              return;
            }
          }
        } else if (ex.type === "image_gallery" || ex.type === "match_names") {
          const hasImages = item.images && item.images.length > 0;
          if (!hasImages) {
            setFormError(
              `Exercise #${i + 1} (${ex.name || "Untitled"}) has item #${j + 1} incomplete. It must have at least one image.`,
            );
            return;
          }
        } else if (ex.type === "overview_session") {
          const hasWords = item.words && item.words.length > 0;
          if (!hasWords) {
            setFormError(
              `Exercise #${i + 1} (${ex.name || "Untitled"}) has section #${j + 1} incomplete. It must have at least one word.`,
            );
            return;
          }
        } else if (ex.type === "say_word" || ex.type === "write_word") {
          const hasUrl = item.image_url && String(item.image_url).trim() !== "";
          const hasTitle = item.image_title && item.image_title.trim() !== "";
          if (!hasUrl || !hasTitle) {
            setFormError(
              `Exercise #${i + 1} (${ex.name || "Untitled"}) has item #${j + 1} incomplete. It must have an image and associated word.`,
            );
            return;
          }
        } else if (ex.type === "speak") {
          const hasCorrect =
            item.correct_answer && item.correct_answer.trim() !== "";
          if (!hasCorrect) {
            setFormError(
              `Exercise #${i + 1} (${ex.name || "Untitled"}) has item #${j + 1} incomplete. It must have the comparison answer.`,
            );
            return;
          }
        } else if (ex.type === "audio_session") {
          const hasFragments = item.fragments && item.fragments.length > 0;
          const hasQuestions = item.questions && item.questions.length > 0;
          if (!hasFragments || !hasQuestions) {
            setFormError(
              `Exercise #${i + 1} (${ex.name || "Untitled"}) has item #${j + 1} incomplete. It must have at least one story fragment and at least one question.`,
            );
            return;
          }
          for (let f = 0; f < item.fragments.length; f++) {
            const frag = item.fragments[f];
            if (!frag.story || !frag.story.trim()) {
              setFormError(
                `Exercise #${i + 1} (${ex.name || "Untitled"}) has fragment #${f + 1} incomplete. It must have story text.`,
              );
              return;
            }
          }
          for (let q = 0; q < item.questions.length; q++) {
            const qItem = item.questions[q];
            if (!qItem.question || !qItem.question.trim()) {
              setFormError(
                `Exercise #${i + 1} (${ex.name || "Untitled"}) has question #${q + 1} incomplete. It must have question text.`,
              );
              return;
            }
            if (!qItem.options || qItem.options.length < 2) {
              setFormError(
                `Exercise #${i + 1} (${ex.name || "Untitled"}) has question #${q + 1} incomplete. It must have at least 2 answer options.`,
              );
              return;
            }
            if (
              qItem.fragment_index === undefined ||
              qItem.fragment_index < 0 ||
              qItem.fragment_index >= item.fragments.length
            ) {
              setFormError(
                `Exercise #${i + 1} (${ex.name || "Untitled"}) has question #${q + 1} associated with an invalid or non-existent fragment.`,
              );
              return;
            }
          }
        } else if (ex.type === "type_answer") {
          const hasDescriptive =
            item.descriptive_text && item.descriptive_text.trim() !== "";
          const hasCorrect =
            item.correct_answer && item.correct_answer.trim() !== "";
          if (!hasDescriptive || !hasCorrect) {
            setFormError(
              `Exercise #${i + 1} (${ex.name || "Untitled"}) has item #${j + 1} incomplete. It must have descriptive text and a correct answer.`,
            );
            return;
          }
        } else if (ex.type === "video_session") {
          const hasUrl = item.video_url && item.video_url.trim() !== "";
          if (!hasUrl) {
            setFormError(
              `Exercise #${i + 1} (${ex.name || "Untitled"}) has item #${j + 1} incomplete. It must have the video URL.`,
            );
            return;
          }
        } else if (ex.type === "identify_picture") {
          const hasAudio =
            item.audio_url && String(item.audio_url).trim() !== "";
          const hasImages =
            item.images && item.images.length >= 2 && item.images.length <= 6;
          if (!hasAudio) {
            setFormError(
              `Exercise #${i + 1} (${ex.name || "Untitled"}) has item #${j + 1} incomplete. An audio file must be selected.`,
            );
            return;
          }
          if (!hasImages) {
            setFormError(
              `Exercise #${i + 1} (${ex.name || "Untitled"}) has item #${j + 1} incomplete. It must have between 2 and 6 option images.`,
            );
            return;
          }
          let correctCount = 0;
          for (let imgIdx = 0; imgIdx < item.images.length; imgIdx++) {
            const img = item.images[imgIdx];
            if (!img.image_url) {
              setFormError(
                `Exercise #${i + 1} (${ex.name || "Untitled"}) has item #${j + 1} incomplete. Option #${imgIdx + 1} does not have an image selected.`,
              );
              return;
            }
            if (img.is_correct) {
              correctCount++;
            }
          }
          if (correctCount !== 1) {
            setFormError(
              `Exercise #${i + 1} (${ex.name || "Untitled"}) has item #${j + 1} incomplete. Exactly one option must be marked as correct (${correctCount} selected).`,
            );
            return;
          }
        }
      }
    }

    if (categoryCounts["Introduction"] < 1) {
      setFormError("At least 1 exercise of type Introduction is required.");
      return;
    }
    if (categoryCounts["Validation"] < 3) {
      setFormError("At least 3 exercises of type Validation are required.");
      return;
    }
    if (sanitizedData.length > 15) {
      setFormError("Maximum of 15 exercises allowed in total.");
      return;
    }

    setIsProcessing(true);
    try {
      const existingIds = (existingExercises || [])
        .map((ex) => ex.id)
        .filter((id): id is string => !!id);
      const currentIds = sanitizedData
        .map((ex) => (ex as any).id)
        .filter((id): id is string => !!id);
      const removedIds = existingIds.filter((id) => !currentIds.includes(id));
      if (removedIds.length > 0) {
        await deleteExercises(removedIds);
      }

      const processedExercises = await Promise.all(
        sanitizedData.map(async ({ tempId, ...exercise }) => {
          const cleanExercise = { ...exercise } as any;
          if (!cleanExercise.id) cleanExercise.id = generateUUID();
          delete cleanExercise.created_at;
          delete cleanExercise.updated_at;
          return processExerciseFiles(cleanExercise);
        }),
      );

      await createExercises(processedExercises);

      await showAlert({
        title: "Exercises saved",
        message: "The exercises have been saved successfully.",
        type: "success",
      });
      clearDraft(classId); // Clear class draft upon successful save
      router.back();
    } catch (error: any) {
      setFormError(error.message || "Failed to save the exercises");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoadingExercises) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-505" />
        <span className="text-sm font-semibold">Loading exercises...</span>
      </div>
    );
  }

  const isSaving = isPending || isProcessing;

  return (
    <div className="w-full space-y-8 animate-fade-in text-slate-800">
      <style>{`
        .custom-grab-cursor {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='black' stroke='white' stroke-width='2'%3E%3Cpath d='M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5m4 0V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2m4 0v1a6 6 0 0 1-6 6H9.5a5.5 5.5 0 0 1-5.5-5.5V9.5A1.5 1.5 0 0 1 5.5 8v0A1.5 1.5 0 0 1 7 9.5V11m3-4.5V3a1.5 1.5 0 0 1 3 0v8'/%3E%3C/svg%3E") 8 8, grab !important;
        }
        .custom-grabbing-cursor:active {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='black' stroke='white' stroke-width='2'%3E%3Cpath d='M18 13V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4m4 0v-2a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2m4 0v1a6 6 0 0 1-6 6H9.5a5.5 5.5 0 0 1-5.5-5.5v-2A1.5 1.5 0 0 1 5.5 10v0A1.5 1.5 0 0 1 7 11.5V13m3-6.5v2A1.5 1.5 0 0 1 13 10v3'/%3E%3C/svg%3E") 8 8, grabbing !important;
        }
      `}</style>
      {/* Navigation Header */}
      <div className="flex flex-col space-y-4">
        <button
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-cyan-600 transition-colors self-start cursor-pointer group"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Classes</span>
        </button>

        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Configure Exercises
          </h1>
          <p className="text-slate-555 text-sm mt-1">
            Design interactive content and validations for the current lesson.
          </p>
        </div>
      </div>

      {/* Collision Warning Banner */}
      {collision && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm animate-fade-in">
          <div className="flex items-start space-x-3.5">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900">
                Draft Conflict Detected!
              </h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed font-semibold">
                The exercises for this lesson were updated on the server by another instructor since your local draft was saved in this browser.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 w-full sm:w-auto self-end sm:self-center shrink-0">
            <Button
              variant="outlined"
              onClick={() => resolveCollisionUseServer()}
              className="py-2 px-3.5 text-xs bg-white border-amber-200 text-amber-900 hover:bg-amber-100/50"
            >
              Load from Server
            </Button>
            <Button
              variant="primary"
              onClick={() => resolveCollisionUseDraft()}
              className="py-2 px-3.5 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 border-none"
            >
              Keep My Draft
            </Button>
          </div>
        </div>
      )}

      {/* Grid Layout: Forms on left, Info panel on right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left column: Exercises forms */}
        <div className="lg:col-span-3 space-y-6">
          {data.map((ex, index) => (
            <div
              key={ex.tempId}
              draggable
              onDragStart={(e) => {
                setDraggedIndex(index);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", index.toString());
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverIndex !== index) {
                  setDragOverIndex(index);
                }
              }}
              onDragLeave={() => {
                setDragOverIndex(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = draggedIndex;
                if (fromIndex !== null && fromIndex !== index) {
                  reorderExercises(fromIndex, index);
                }
                setDraggedIndex(null);
                setDragOverIndex(null);
              }}
              onDragEnd={() => {
                setDraggedIndex(null);
                setDragOverIndex(null);
              }}
              className={`transition-all duration-200 custom-grab-cursor custom-grabbing-cursor ${
                draggedIndex === index ? "opacity-30 scale-[0.98]" : ""
              } ${
                dragOverIndex === index && draggedIndex !== index
                  ? "ring-2 ring-cyan-500 ring-offset-2 rounded-2xl scale-[1.01]"
                  : ""
              }`}
            >
              <CreateExercise
                index={index}
                moveUp={() => moveUp(index)}
                moveDown={() => moveDown(index)}
                onRemove={() => handleRemove(index)}
              />
            </div>
          ))}

          {/* Form wide error notification */}
          {formError && (
            <div className="flex items-center space-x-2.5 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-semibold">{formError}</span>
            </div>
          )}
        </div>

        {/* Right column: Info & requirements card (sticky on large screens) */}
        <div className="lg:col-span-1 lg:sticky lg:top-6 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-md space-y-5">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Lesson Status
              </h3>
              <p className="text-[10px] text-slate-550 mt-0.5 font-bold">
                Minimum requirements & metrics
              </p>
            </div>

            {/* Total Items Tracker */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-slate-600">
                  Created exercises
                </span>
                <span
                  className={`text-base font-extrabold ${totalValid ? "text-cyan-600" : "text-rose-600"}`}
                >
                  {data.length}{" "}
                  <span className="text-xs font-semibold text-slate-400">
                    / 15
                  </span>
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200/80 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    totalValid
                      ? "bg-primary shadow-[0_0_8px_rgba(36,223,226,0.3)]"
                      : "bg-rose-500"
                  }`}
                  style={{
                    width: `${Math.min((data.length / 15) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Mandatory requirements
              </span>

              {/* Requirement 1: Introduction */}
              <div className="flex items-start space-x-2.5">
                {introValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-605 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-xs font-bold text-slate-700 leading-tight">
                    Introduction: {categoryCounts["Introduction"]}{" "}
                    <span className="text-[10px] font-semibold text-slate-450">
                      / min. 1
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                    Vocabulary presentation modules.
                  </p>
                </div>
              </div>

              {/* Requirement 2: Validation */}
              <div className="flex items-start space-x-2.5">
                {valValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-605 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-xs font-bold text-slate-700 leading-tight">
                    Validation: {categoryCounts["Validation"]}{" "}
                    <span className="text-[10px] font-semibold text-slate-450">
                      / min. 3
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                    Assessed interactive exercises.
                  </p>
                </div>
              </div>

              {/* Requirement 3: Max Cap */}
              <div className="flex items-start space-x-2.5">
                {totalValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-605 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-xs font-bold text-slate-700 leading-tight">
                    Maximum exercises
                  </p>
                  <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                    Do not exceed 15 items per lesson.
                  </p>
                </div>
              </div>
            </div>

            {/* Borrador Local */}
            {hasDraft && (
              <div className="p-3.5 bg-amber-50/50 border border-amber-200/60 rounded-xl space-y-2.5 shadow-sm">
                <div className="flex items-center space-x-2 text-amber-800 text-[10px] font-extrabold uppercase tracking-wide">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Active Local Draft</span>
                </div>
                <button
                  type="button"
                  onClick={handleDiscardDraft}
                  disabled={isSaving}
                  className="w-full text-center text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50/50 hover:bg-rose-50 border border-rose-100/80 py-1.5 px-3 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Discard local draft
                </button>
              </div>
            )}

            {/* Quick Helper Banner */}
            {/* <div className="p-3 bg-slate-55 rounded-xl border border-slate-150 text-[10px] leading-relaxed text-slate-600 font-semibold">
              💡 <span className="text-cyan-700 font-extrabold">Tip:</span>{" "}
              Puedes arrastrar y soltar, o usar las flechas (↑, ↓) para ordenar
              los formularios.
            </div> */}
          </div>
          {/* action buttons */}
          <div className="flex flex-col gap-4 border-slate-200">
            <Button
              variant="outlined"
              onClick={handleAddAnother}
              disabled={isSaving}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add exercise
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveAll}
              isLoading={isSaving}
              disabled={isSaving}
              leftIcon={!isSaving && <Save className="w-4 h-4" />}
            >
              {isProcessing ? "Uploading files…" : "Save All"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
