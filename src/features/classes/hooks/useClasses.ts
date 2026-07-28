"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClass, deleteClass, fetchClasses, updateClass } from '../services/class.service';
import { ClassModel } from '../class.types';

export const useClasses = (id_unit: string) => {
  return useQuery<ClassModel[]>({
    queryKey: ["classes", id_unit],
    queryFn: () => fetchClasses(id_unit),
    enabled: !!id_unit,
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClass,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["classes", data.id_unit] });
    },
    onError: (error) => {
      console.error("Error al crear la clase:", error);
    },
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClass,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["classes", data.id_unit] });
    },
    onError: (error) => {
      console.error("Error al actualizar la clase:", error);
    },
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, unitId }: { classId: string; unitId: string }) =>
      deleteClass(classId, unitId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["classes", variables.unitId] });
    },
    onError: (error) => {
      console.error("Error al eliminar la clase:", error);
    },
  });
};
