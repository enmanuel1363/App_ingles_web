"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUnit, fetchUnits, updateUnit, deleteUnit } from '../services/unit.service';
import { Unit } from '../unit.types';

export const useUnits = (courseId: string, initialUnits?: Unit[]) => {
  return useQuery<Unit[]>({
    queryKey: ["units", courseId],
    queryFn: () => fetchUnits(courseId),
    enabled: !!courseId,
    initialData: initialUnits,
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

export const useUpdateUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, unit }: { id: string; unit: Partial<Omit<Unit, "id" | "created_at" | "updated_at">> }) =>
      updateUnit(id, unit),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["units", data.id_course] });
    },
    onError: (error) => {
      console.error("Error al actualizar la unidad:", error);
    },
  });
};

export const useDeleteUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
    onError: (error) => {
      console.error("Error al eliminar la unidad:", error);
    },
  });
};
