"use client";

import { create } from "zustand";
import { CreateExerciseDTO, Exercise } from '../exercise.types';

export type StoreExercise = (CreateExerciseDTO | Exercise) & { tempId: string };

type StoreTypes = {
  data: StoreExercise[];
  setExercises: (exercises: Exercise[]) => void;
  addExercise: (exercise: CreateExerciseDTO) => void;
  updateExercise: (index: number, exercise: CreateExerciseDTO | Exercise) => void;
  removeExercise: (index: number) => void;
  moveUp: (index: number) => void;
  moveDown: (index: number) => void;
  reset: () => void;
};

export const useExerciseStore = create<StoreTypes>((set) => ({
  data: [],
  setExercises: (exercises) =>
    set(() => ({
      data: exercises.map((ex) => ({
        ...ex,
        tempId: ex.id || Math.random().toString(36).slice(2, 9),
      })),
    })),
  addExercise: (exercise) =>
    set((state) => ({
      data: [
        ...state.data,
        { ...exercise, tempId: Math.random().toString(36).slice(2, 9) },
      ],
    })),
  updateExercise: (index, exercise) =>
    set((state) => {
      const newData = [...state.data];
      newData[index] = {
        ...exercise,
        tempId: state.data[index]?.tempId || Math.random().toString(36).slice(2, 9),
      };
      return { data: newData };
    }),
  removeExercise: (index) =>
    set((state) => {
      const filtered = state.data.filter((_, i) => i !== index);
      const reindexed = filtered.map((ex, i) => ({ ...ex, order_index: i }));
      return { data: reindexed };
    }),
  moveUp: (index) =>
    set((state) => {
      if (index <= 0 || index >= state.data.length) return {};
      const newData = [...state.data];
      [newData[index - 1], newData[index]] = [newData[index], newData[index - 1]];
      return { data: newData.map((ex, i) => ({ ...ex, order_index: i })) };
    }),
  moveDown: (index) =>
    set((state) => {
      if (index < 0 || index >= state.data.length - 1) return {};
      const newData = [...state.data];
      [newData[index], newData[index + 1]] = [newData[index + 1], newData[index]];
      return { data: newData.map((ex, i) => ({ ...ex, order_index: i })) };
    }),
  reset: () => set({ data: [] }),
}));
