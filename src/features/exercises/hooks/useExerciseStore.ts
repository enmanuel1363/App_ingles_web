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

export type DraftInfo = {
  exercises: StoreExercise[];
  baseDbUpdatedAt: string | null;
  updatedAt: number;
};

export type CollisionInfo = {
  classId: string;
  dbExercises: Exercise[];
  draftExercises: StoreExercise[];
} | null;

type StoreTypes = {
  classId: string | null;
  data: StoreExercise[];
  collision: CollisionInfo;
  drafts: Record<string, DraftInfo | StoreExercise[]>;
  initializeExercises: (classId: string, dbExercises: Exercise[]) => void;
  resolveCollisionUseDraft: () => void;
  resolveCollisionUseServer: () => void;
  addExercise: (exercise: CreateExerciseDTO) => void;
  updateExercise: (index: number, exercise: CreateExerciseDTO | Exercise) => void;
  removeExercise: (index: number) => void;
  moveUp: (index: number) => void;
  moveDown: (index: number) => void;
  reorderExercises: (fromIndex: number, toIndex: number) => void;
  clearDraft: (classId: string) => void;
  reset: () => void;
};

function getDraftInfo(draft: DraftInfo | StoreExercise[] | undefined): DraftInfo | null {
  if (!draft) return null;
  if (Array.isArray(draft)) {
    return {
      exercises: draft,
      baseDbUpdatedAt: null,
      updatedAt: Date.now(),
    };
  }
  return draft;
}

function getLatestUpdatedAt(exercises: Exercise[]): string | null {
  let latest: string | null = null;
  for (const ex of exercises) {
    if (ex.updated_at) {
      if (!latest || ex.updated_at > latest) {
        latest = ex.updated_at;
      }
    }
  }
  return latest;
}

function updateDraftHelper(
  classId: string | null,
  newData: StoreExercise[],
  drafts: Record<string, DraftInfo | StoreExercise[]>
): Record<string, DraftInfo | StoreExercise[]> {
  if (!classId) return drafts;
  const rawDraft = drafts[classId];
  const draft = getDraftInfo(rawDraft);
  return {
    ...drafts,
    [classId]: {
      exercises: newData,
      baseDbUpdatedAt: draft ? draft.baseDbUpdatedAt : null,
      updatedAt: Date.now(),
    },
  };
}

export const useExerciseStore = create<StoreTypes>()(
  persist(
    (set) => ({
      classId: null,
      data: [],
      collision: null,
      drafts: {},

      initializeExercises: (classId, dbExercises) =>
        set((state) => {
          const rawDraft = state.drafts[classId];
          const draft = getDraftInfo(rawDraft);
          const latestDbUpdate = getLatestUpdatedAt(dbExercises);

          // 1. Si ya existe un borrador persistido para esta clase, lo cargamos en memoria
          if (draft && draft.exercises.length > 0) {
            // Validar colisión: Si el servidor tiene una actualización más reciente que la base del borrador
            if (
              latestDbUpdate &&
              draft.baseDbUpdatedAt &&
              latestDbUpdate > draft.baseDbUpdatedAt
            ) {
              return {
                classId,
                collision: {
                  classId,
                  dbExercises,
                  draftExercises: draft.exercises,
                },
                data: draft.exercises,
              };
            }

            return {
              classId,
              data: draft.exercises,
              collision: null,
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

          const newDraft: DraftInfo = {
            exercises: finalData,
            baseDbUpdatedAt: latestDbUpdate,
            updatedAt: Date.now(),
          };

          return {
            classId,
            data: finalData,
            collision: null,
            drafts: {
              ...state.drafts,
              [classId]: newDraft,
            },
          };
        }),

      resolveCollisionUseDraft: () =>
        set((state) => {
          const classId = state.classId;
          if (!classId || !state.collision) return {};

          const latestDbUpdate = getLatestUpdatedAt(state.collision.dbExercises);
          const rawDraft = state.drafts[classId];
          const draft = getDraftInfo(rawDraft);

          if (!draft) return {};

          const updatedDraft: DraftInfo = {
            ...draft,
            baseDbUpdatedAt: latestDbUpdate,
            updatedAt: Date.now(),
          };

          return {
            collision: null,
            drafts: {
              ...state.drafts,
              [classId]: updatedDraft,
            },
          };
        }),

      resolveCollisionUseServer: () =>
        set((state) => {
          const classId = state.classId;
          if (!classId || !state.collision) return {};

          const dbExercises = state.collision.dbExercises;
          const initialData = dbExercises.map((ex) => ({
            ...ex,
            tempId: ex.id || Math.random().toString(36).slice(2, 9),
          }));

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

          const latestDbUpdate = getLatestUpdatedAt(dbExercises);
          const newDraft: DraftInfo = {
            exercises: finalData,
            baseDbUpdatedAt: latestDbUpdate,
            updatedAt: Date.now(),
          };

          return {
            data: finalData,
            collision: null,
            drafts: {
              ...state.drafts,
              [classId]: newDraft,
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
            drafts: updateDraftHelper(state.classId, newData, state.drafts),
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
            drafts: updateDraftHelper(state.classId, newData, state.drafts),
          };
        }),

      removeExercise: (index) =>
        set((state) => {
          const filtered = state.data.filter((_, i) => i !== index);
          const reindexed = filtered.map((ex, i) => ({ ...ex, order_index: i }));
          return {
            data: reindexed,
            drafts: updateDraftHelper(state.classId, reindexed, state.drafts),
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
            drafts: updateDraftHelper(state.classId, reindexed, state.drafts),
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
            drafts: updateDraftHelper(state.classId, reindexed, state.drafts),
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
            drafts: updateDraftHelper(state.classId, reindexed, state.drafts),
          };
        }),

      clearDraft: (classId) =>
        set((state) => {
          const newDrafts = { ...state.drafts };
          delete newDrafts[classId];
          return {
            data: [],
            classId: null,
            collision: null,
            drafts: newDrafts,
          };
        }),

      reset: () => set({ data: [], classId: null, collision: null }),
    }),
    {
      name: "exercise-editor-drafts-map",
      partialize: (state) => ({
        drafts: replaceFilesWithPlaceholders(state.drafts),
      }),
    }
  )
);
