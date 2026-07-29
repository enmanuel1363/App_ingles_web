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
    setExercises,
    moveUp,
    moveDown,
    reset,
  } = useExerciseStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: existingExercises, isLoading: isLoadingExercises } =
    useGetExercises(classId);
  const { mutateAsync: createExercises, isPending } = useCreateExercises();

  useEffect(() => {
    if (existingExercises && existingExercises.length > 0) {
      setExercises(existingExercises);
    } else if (existingExercises && existingExercises.length === 0) {
      addExercise({
        id_class: classId,
        name: "",
        description: EXERCISE_DEFAULT_DESCRIPTIONS["complete_word"] || "",
        type: "complete_word",
        content: EXERCISE_DEFAULT_CONTENT["complete_word"],
        order_index: 0,
      });
    }
    return () => reset();
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

    const invalid = data.some((ex) => !ex.name || ex.name.length < 3);
    if (invalid) {
      setFormError("Please complete the names of all exercises.");
      return;
    }

    if (categoryCounts["Introducción"] < 2) {
      setFormError("At least 2 exercises of type Introducción are required.");
      return;
    }
    if (categoryCounts["Validación"] < 3) {
      setFormError("At least 3 exercises of type Validación are required.");
      return;
    }
    if (data.length > 12) {
      setFormError("Maximum of 12 exercises allowed in total.");
      return;
    }

    setIsProcessing(true);
    try {
      const existingIds = (existingExercises || [])
        .map((ex) => ex.id)
        .filter((id): id is string => !!id);
      const currentIds = data
        .map((ex) => (ex as any).id)
        .filter((id): id is string => !!id);
      const removedIds = existingIds.filter((id) => !currentIds.includes(id));
      if (removedIds.length > 0) {
        await deleteExercises(removedIds);
      }

      const processedExercises = await Promise.all(
        data.map(async ({ tempId, ...exercise }) => {
          const cleanExercise = { ...exercise } as any;
          if (!cleanExercise.id) cleanExercise.id = generateUUID();
          delete cleanExercise.created_at;
          delete cleanExercise.updated_at;
          return processExerciseFiles(cleanExercise);
        }),
      );

      const savedExercises = await createExercises(processedExercises);
      if (savedExercises && savedExercises.length > 0) {
        setExercises(savedExercises);
      }

      await showAlert({
        title: "Ejercicios guardados",
        message: "Los ejercicios han sido guardados exitosamente.",
        type: "success",
      });
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
            <CreateExercise
              key={ex.tempId}
              index={index}
              moveUp={() => moveUp(index)}
              moveDown={() => moveDown(index)}
              onRemove={() => handleRemove(index)}
            />
          ))}

          {/* Form wide error notification */}
          {formError && (
            <div className="flex items-center space-x-2.5 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-semibold">{formError}</span>
            </div>
          )}

          {/* Footer action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-200 pt-6 pb-12">
            <Button
              variant="outlined"
              onClick={handleAddAnother}
              disabled={isSaving}
              leftIcon={<Plus className="w-4 h-4" />}
              className="w-full sm:w-1/2 py-3.5"
            >
              Add other exercises
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveAll}
              isLoading={isSaving}
              disabled={isSaving}
              leftIcon={!isSaving && <Save className="w-4 h-4" />}
              className="w-full sm:w-1/2 py-3.5"
            >
              {isProcessing ? "Subiendo archivos…" : "Save exercises"}
            </Button>
          </div>
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
              Puedes arrastrar o reordenar los ejercicios usando las flechas de
              ordenación (↑, ↓) en cada formulario a la izquierda.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
