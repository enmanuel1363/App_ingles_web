"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CreateExerciseDTO, Exercise } from '../exercise.types';

// Helper to replace File/Blob objects with serializable placeholders before storing in localStorage
function replaceFilesWithPlaceholders(val: any): any {
  if (typeof window !== "undefined" && (val instanceof File || val instanceof Blob)) {
    return {
      __isDraftPlaceholder: true,
      name: (val as any).name || "archivo_temporal",
      type: val.type,
      size: val.size,
    };
  }
  if (Array.isArray(val)) {
    return val.map(replaceFilesWithPlaceholders);
  }
  if (val !== null && typeof val === "object") {
    const obj: any = {};
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        obj[key] = replaceFilesWithPlaceholders(val[key]);
      }
    }
    return obj;
  }
  return val;
}


export type StoreExercise = (CreateExerciseDTO | Exercise) & { tempId: string };

type StoreTypes = {
  classId: string | null;
  data: StoreExercise[];
  drafts: Record<string, StoreExercise[]>;
  initializeExercises: (classId: string, dbExercises: Exercise[]) => void;
  addExercise: (exercise: CreateExerciseDTO) => void;
  updateExercise: (index: number, exercise: CreateExerciseDTO | Exercise) => void;
  removeExercise: (index: number) => void;
  moveUp: (index: number) => void;
  moveDown: (index: number) => void;
  reorderExercises: (fromIndex: number, toIndex: number) => void;
  clearDraft: (classId: string) => void;
  reset: () => void;
};

export const useExerciseStore = create<StoreTypes>()(
  persist(
    (set) => ({
      classId: null,
      data: [],
      drafts: {},

      initializeExercises: (classId, dbExercises) =>
        set((state) => {
          // 1. Si ya existe un borrador persistido para esta clase, lo cargamos en memoria
          const draft = state.drafts[classId];
          if (draft && draft.length > 0) {
            return {
              classId,
              data: draft,
            };
          }

          // 2. Si no hay borrador, mapeamos los ejercicios de la base de datos
          const initialData = dbExercises.map((ex) => ({
            ...ex,
            tempId: ex.id || Math.random().toString(36).slice(2, 9),
          }));

          // Si la clase no tiene ejercicios guardados, inicializamos con uno vacío por defecto
          const finalData =
            initialData.length > 0
              ? initialData
              : [
                  {
                    id_class: classId,
                    name: "",
                    description: "Completa la palabra con las letras correctas",
                    type: "complete_word",
                    content: {
                      word: "",
                      letters: [],
                    },
                    order_index: 0,
                    tempId: Math.random().toString(36).slice(2, 9),
                  } as unknown as StoreExercise,
                ];

          return {
            classId,
            data: finalData,
            drafts: {
              ...state.drafts,
              [classId]: finalData,
            },
          };
        }),

      addExercise: (exercise) =>
        set((state) => {
          const newExercise = {
            ...exercise,
            tempId: Math.random().toString(36).slice(2, 9),
          };
          const newData = [...state.data, newExercise];
          return {
            data: newData,
            drafts: state.classId
              ? { ...state.drafts, [state.classId]: newData }
              : state.drafts,
          };
        }),

      updateExercise: (index, exercise) =>
        set((state) => {
          const newData = [...state.data];
          newData[index] = {
            ...exercise,
            tempId: state.data[index]?.tempId || Math.random().toString(36).slice(2, 9),
          };
          return {
            data: newData,
            drafts: state.classId
              ? { ...state.drafts, [state.classId]: newData }
              : state.drafts,
          };
        }),

      removeExercise: (index) =>
        set((state) => {
          const filtered = state.data.filter((_, i) => i !== index);
          const reindexed = filtered.map((ex, i) => ({ ...ex, order_index: i }));
          return {
            data: reindexed,
            drafts: state.classId
              ? { ...state.drafts, [state.classId]: reindexed }
              : state.drafts,
          };
        }),

      moveUp: (index) =>
        set((state) => {
          if (index <= 0 || index >= state.data.length) return {};
          const newData = [...state.data];
          [newData[index - 1], newData[index]] = [newData[index], newData[index - 1]];
          const reindexed = newData.map((ex, i) => ({ ...ex, order_index: i }));
          return {
            data: reindexed,
            drafts: state.classId
              ? { ...state.drafts, [state.classId]: reindexed }
              : state.drafts,
          };
        }),

      moveDown: (index) =>
        set((state) => {
          if (index < 0 || index >= state.data.length - 1) return {};
          const newData = [...state.data];
          [newData[index], newData[index + 1]] = [newData[index + 1], newData[index]];
          const reindexed = newData.map((ex, i) => ({ ...ex, order_index: i }));
          return {
            data: reindexed,
            drafts: state.classId
              ? { ...state.drafts, [state.classId]: reindexed }
              : state.drafts,
          };
        }),

      reorderExercises: (fromIndex, toIndex) =>
        set((state) => {
          if (
            fromIndex < 0 ||
            fromIndex >= state.data.length ||
            toIndex < 0 ||
            toIndex >= state.data.length
          )
            return {};
          const newData = [...state.data];
          const [removed] = newData.splice(fromIndex, 1);
          newData.splice(toIndex, 0, removed);
          const reindexed = newData.map((ex, i) => ({ ...ex, order_index: i }));
          return {
            data: reindexed,
            drafts: state.classId
              ? { ...state.drafts, [state.classId]: reindexed }
              : state.drafts,
          };
        }),

      clearDraft: (classId) =>
        set((state) => {
          const newDrafts = { ...state.drafts };
          delete newDrafts[classId];
          return {
            data: [],
            classId: null,
            drafts: newDrafts,
          };
        }),

      reset: () => set({ data: [], classId: null }),
    }),
    {
      name: "exercise-editor-drafts-map",
      partialize: (state) => ({
        drafts: replaceFilesWithPlaceholders(state.drafts),
      }),
    }
  )
);
