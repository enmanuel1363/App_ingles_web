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
  const { showAlert } = useModal();
  const {
    data,
    addExercise,
    removeExercise,
    initializeExercises,
    clearDraft,
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

    const handleWindowDragOver = (e: DragEvent) => {
      const threshold = 120; // px desde el borde
      const speed = 12; // velocidad de desplazamiento
      const clientY = e.clientY;
      const windowHeight = window.innerHeight;

      if (clientY < threshold) {
        window.scrollBy(0, -speed);
      } else if (clientY > windowHeight - threshold) {
        window.scrollBy(0, speed);
      }
    };

    window.addEventListener("dragover", handleWindowDragOver);
    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
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
    Introducción: 0,
    Validación: 0,
  };
  data.forEach((ex) => {
    const cat = EXERCISE_CATEGORIES[ex.type];
    if (cat === "Introducción" || cat === "Validación") {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
  });

  const introValid = categoryCounts["Introducción"] >= 2;
  const valValid = categoryCounts["Validación"] >= 3;
  const totalValid = data.length <= 12;

  const handleAddAnother = () => {
    if (data.length >= 12) {
      setFormError("Maximum of 12 exercises allowed in total.");
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

    // Calculate validation on the fly to show a friendly warning warning
    const countsAfter = {
      Introducción: 0,
      Validación: 0,
    };
    data.forEach((ex, i) => {
      if (i === index) return;
      const cat = EXERCISE_CATEGORIES[ex.type];
      if (cat === "Introducción" || cat === "Validación") {
        countsAfter[cat] = (countsAfter[cat] || 0) + 1;
      }
    });

    if (removedCat === "Introducción" && countsAfter["Introducción"] < 2) {
      setFormError(
        "Recuerda que necesitas un mínimo de 2 ejercicios de tipo Introducción para poder guardar.",
      );
    } else if (removedCat === "Validación" && countsAfter["Validación"] < 3) {
      setFormError(
        "Recuerda que necesitas un mínimo de 3 ejercicios de tipo Validación para poder guardar.",
      );
    } else {
      setFormError(null);
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
        setFormError(`El ejercicio #${i + 1} (${ex.name || "Sin nombre"}) no tiene ítems.`);
        return;
      }

      for (let j = 0; j < items.length; j++) {
        const item = items[j];

        if (ex.type === "complete_word" || ex.type === "reading_quiz") {
          const hasCorrect = item.correct_answer && item.correct_answer.trim() !== "";
          const hasPossibles = item.possible_answers && item.possible_answers.length > 0;
          if (!hasCorrect || !hasPossibles) {
            setFormError(
              `El ejercicio #${i + 1} (${ex.name || "Sin nombre"}) tiene el ítem #${j + 1} incompleto. Debe tener respuesta correcta y posibles respuestas.`
            );
            return;
          }
        } else if (ex.type === "image_gallery" || ex.type === "match_names") {
          const hasImages = item.images && item.images.length > 0;
          if (!hasImages) {
            setFormError(
              `El ejercicio #${i + 1} (${ex.name || "Sin nombre"}) tiene el ítem #${j + 1} incompleto. Debe tener al menos una imagen.`
            );
            return;
          }
        } else if (ex.type === "overview_session") {
          const hasWords = item.words && item.words.length > 0;
          if (!hasWords) {
            setFormError(
              `El ejercicio #${i + 1} (${ex.name || "Sin nombre"}) tiene la sección #${j + 1} incompleta. Debe tener al menos una palabra.`
            );
            return;
          }
        } else if (ex.type === "say_word" || ex.type === "write_word") {
          const hasUrl = item.image_url && String(item.image_url).trim() !== "";
          const hasTitle = item.image_title && item.image_title.trim() !== "";
          if (!hasUrl || !hasTitle) {
            setFormError(
              `El ejercicio #${i + 1} (${ex.name || "Sin nombre"}) tiene el ítem #${j + 1} incompleto. Debe tener imagen y palabra asociada.`
            );
            return;
          }
        } else if (ex.type === "speak") {
          const hasCorrect = item.correct_answer && item.correct_answer.trim() !== "";
          if (!hasCorrect) {
            setFormError(
              `El ejercicio #${i + 1} (${ex.name || "Sin nombre"}) tiene el ítem #${j + 1} incompleto. Debe tener la respuesta de comparación.`
            );
            return;
          }
        } else if (ex.type === "audio_session") {
          const hasStory = item.story && item.story.trim() !== "";
          const hasQuestions = item.questions && item.questions.length > 0;
          if (!hasStory || !hasQuestions) {
            setFormError(
              `El ejercicio #${i + 1} (${ex.name || "Sin nombre"}) tiene el ítem #${j + 1} incompleto. Debe tener texto de historia y al menos una pregunta.`
            );
            return;
          }
        } else if (ex.type === "type_answer") {
          const hasDescriptive = item.descriptive_text && item.descriptive_text.trim() !== "";
          const hasCorrect = item.correct_answer && item.correct_answer.trim() !== "";
          if (!hasDescriptive || !hasCorrect) {
            setFormError(
              `El ejercicio #${i + 1} (${ex.name || "Sin nombre"}) tiene el ítem #${j + 1} incompleto. Debe tener texto descriptivo y respuesta correcta.`
            );
            return;
          }
        } else if (ex.type === "video_session") {
          const hasUrl = item.video_url && item.video_url.trim() !== "";
          if (!hasUrl) {
            setFormError(
              `El ejercicio #${i + 1} (${ex.name || "Sin nombre"}) tiene el ítem #${j + 1} incompleto. Debe tener la URL del video.`
            );
            return;
          }
        }
      }
    }

    if (categoryCounts["Introducción"] < 2) {
      setFormError("At least 2 exercises of type Introducción are required.");
      return;
    }
    if (categoryCounts["Validación"] < 3) {
      setFormError("At least 3 exercises of type Validación are required.");
      return;
    }
    if (sanitizedData.length > 12) {
      setFormError("Maximum of 12 exercises allowed in total.");
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
        title: "Ejercicios guardados",
        message: "Los ejercicios han sido guardados exitosamente.",
        type: "success",
      });
      clearDraft(classId); // Limpiar el borrador de la clase al guardar con éxito
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
            Configurar Ejercicios
          </h1>
          <p className="text-slate-555 text-sm mt-1">
            Diseña el contenido interactivo y las validaciones del aula actual.
          </p>
        </div>
      </div>

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
                Estado de la lección
              </h3>
              <p className="text-[10px] text-slate-550 mt-0.5 font-bold">
                Requisitos mínimos y métricas
              </p>
            </div>

            {/* Total Items Tracker */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-slate-600">
                  Ejercicios creados
                </span>
                <span
                  className={`text-base font-extrabold ${totalValid ? "text-cyan-600" : "text-rose-600"}`}
                >
                  {data.length}{" "}
                  <span className="text-xs font-semibold text-slate-400">
                    / 12
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
                    width: `${Math.min((data.length / 12) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Requisitos obligatorios
              </span>

              {/* Requirement 1: Introducción */}
              <div className="flex items-start space-x-2.5">
                {introValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-605 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-xs font-bold text-slate-700 leading-tight">
                    Introducción: {categoryCounts["Introducción"]}{" "}
                    <span className="text-[10px] font-semibold text-slate-450">
                      / mín. 2
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                    Módulos de presentación de vocabulario.
                  </p>
                </div>
              </div>

              {/* Requirement 2: Validación */}
              <div className="flex items-start space-x-2.5">
                {valValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-605 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-xs font-bold text-slate-700 leading-tight">
                    Validación: {categoryCounts["Validación"]}{" "}
                    <span className="text-[10px] font-semibold text-slate-450">
                      / mín. 3
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                    Ejercicios interactivos evaluados.
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
                    Máximo de ejercicios
                  </p>
                  <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                    No exceder los 12 elementos por lección.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Helper Banner */}
            <div className="p-3 bg-slate-55 rounded-xl border border-slate-150 text-[10px] leading-relaxed text-slate-600 font-semibold">
              💡 <span className="text-cyan-700 font-extrabold">Tip:</span>{" "}
              Puedes arrastrar las tarjetas de los ejercicios directamente para
              reordenarlos, o usar las flechas de ordenación (↑, ↓) en cada
              formulario.
            </div>
          </div>

          {/* Footer action buttons */}
          <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 pb-12">
            <Button
              variant="outlined"
              onClick={handleAddAnother}
              disabled={isSaving}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add other exercises
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveAll}
              isLoading={isSaving}
              disabled={isSaving}
              leftIcon={!isSaving && <Save className="w-4 h-4" />}
            >
              {isProcessing ? "Subiendo archivos…" : "Save exercises"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
