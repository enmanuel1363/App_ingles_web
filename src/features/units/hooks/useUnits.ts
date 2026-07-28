"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUnit, fetchUnits } from '../services/unit.service';
import { Unit } from '../unit.types';

export const useUnits = (courseId: string) => {
  return useQuery<Unit[]>({
    queryKey: ["units", courseId],
    queryFn: () => fetchUnits(courseId),
    enabled: !!courseId,
  });
};

export const useCreateUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUnit,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["units", data.id_course] });
    },
    onError: (error) => {
      console.error("Error al crear la unidad:", error);
    },
  });
};
