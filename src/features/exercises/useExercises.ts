"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createExercises,
  getAllExercisesByType,
  getExercisesByClass,
} from "./exercise.service";
import { lesson_type } from "@/types/global.types";

export const useGetExercises = (classId: string) => {
  return useQuery({
    queryKey: ["exercises", classId],
    queryFn: () => getExercisesByClass(classId),
    enabled: !!classId,
  });
};

export const useGetAllExercises = (type: lesson_type) => {
  return useQuery({
    queryKey: ["exercises", "by-type", type],
    queryFn: () => getAllExercisesByType(type),
    enabled: !!type,
  });
};

export const useCreateExercises = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExercises,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
    onError: (error) => {
      console.error("Error al crear los ejercicios:", error);
    },
  });
};
