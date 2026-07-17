"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./AddExercisesPage.module.css";
import CreateExercise from "./CreateExercise";
import { EXERCISE_CATEGORIES, EXERCISE_DEFAULT_CONTENT, EXERCISE_DEFAULT_DESCRIPTIONS } from "./exercise-constants";
import { useCreateExercises, useGetExercises } from "./useExercises";
import { useExerciseStore } from "./useExerciseStore";
import { deleteExercises, processExerciseFiles } from "./storage.service";

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
  const { data, addExercise, removeExercise, setExercises, moveUp, moveDown, reset } =
    useExerciseStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const getExerciseItemCount = (ex: any): number => {
    const items = ex.content?.items;
    if (Array.isArray(items) && items.length > 0) return items.length;
    return 1;
  };

  const totalItemCount = data.reduce((sum, ex) => sum + getExerciseItemCount(ex), 0);

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

  const handleAddAnother = () => {
    if (totalItemCount >= 12) {
      setFormError("Maximum of 12 items allowed in total.");
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
    const countsAfter: Record<string, number> = {};
    data.forEach((ex, i) => {
      if (i === index) return;
      const cat = EXERCISE_CATEGORIES[ex.type];
      if (cat) countsAfter[cat] = (countsAfter[cat] || 0) + getExerciseItemCount(ex);
    });

    if (removedCat === "Introducción" && (countsAfter["Introducción"] || 0) < 2) {
      setFormError("At least 2 items of type Introducción are required.");
      return;
    }
    if (removedCat === "Validación" && (countsAfter["Validación"] || 0) < 3) {
      setFormError("At least 3 items of type Validación are required.");
      return;
    }

    removeExercise(index);
  };

  const handleSaveAll = async () => {
    setFormError(null);

    const invalid = data.some((ex) => !ex.name || ex.name.length < 3);
    if (invalid) {
      setFormError("Please complete the names of all exercises.");
      return;
    }

    const categoryCounts: Record<string, number> = {};
    data.forEach((ex) => {
      const cat = EXERCISE_CATEGORIES[ex.type];
      if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + getExerciseItemCount(ex);
    });

    if ((categoryCounts["Introducción"] || 0) < 2) {
      setFormError("At least 2 items of type Introducción are required.");
      return;
    }
    if ((categoryCounts["Validación"] || 0) < 3) {
      setFormError("At least 3 items of type Validación are required.");
      return;
    }
    if (totalItemCount > 12) {
      setFormError("Maximum of 12 items allowed in total.");
      return;
    }

    setIsProcessing(true);
    try {
      const existingIds = (existingExercises || [])
        .map((ex) => ex.id)
        .filter((id): id is string => !!id);
      const currentIds = data.map((ex) => (ex as any).id).filter((id): id is string => !!id);
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

      alert("Exercises saved successfully");
      router.back();
    } catch (error: any) {
      setFormError(error.message || "Failed to save the exercises");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoadingExercises) {
    return <div className={styles.center}>Loading exercises...</div>;
  }

  return (
    <div className={styles.container}>
      <button className={styles.backLink} onClick={() => router.back()}>
        ‹ Back to Classes
      </button>

      <div className={styles.header}>
        <h1 className={styles.headerTitle}>Config exercises</h1>
        <p className={styles.headerSubtitle}>
          {data.length} {data.length === 1 ? "exercise" : "exercises"} in total
        </p>
      </div>

      {data.map((ex, index) => (
        <CreateExercise
          key={ex.tempId}
          index={index}
          moveUp={() => moveUp(index)}
          moveDown={() => moveDown(index)}
          onRemove={() => handleRemove(index)}
        />
      ))}

      {formError && (
        <p style={{ color: "#ef4444", fontSize: 14, fontWeight: 500 }}>{formError}</p>
      )}

      <div className={styles.footer}>
        <button
          className={`${styles.button} ${styles.buttonOutline}`}
          onClick={handleAddAnother}
          disabled={isPending || isProcessing}
        >
          Add other exercises
        </button>
        <button
          className={`${styles.button} ${styles.buttonPrimary}`}
          onClick={handleSaveAll}
          disabled={isPending || isProcessing}
        >
          {isProcessing ? "Subiendo archivos…" : isPending ? "Guardando…" : "Save exercises"}
        </button>
      </div>
    </div>
  );
}
