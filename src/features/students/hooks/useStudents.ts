"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentsService } from "../services/students.service";

export const useStudents = (initialPage = 1, pageSize = 10) => {
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isPlaceholderData,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["students", { page, pageSize, search }],
    queryFn: () => studentsService.getStudents({ page, pageSize, search }),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30, // 30 seconds fresh cache
  });

  const { data: grades = [], isLoading: isLoadingGrades } = useQuery({
    queryKey: ["available-grades"],
    queryFn: studentsService.getAvailableGrades,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });

  const addGradeMutation = useMutation({
    mutationFn: ({ studentId, gradeId }: { studentId: string; gradeId: string }) =>
      studentsService.addGradeToStudent(studentId, gradeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const updateGradeAssignmentMutation = useMutation({
    mutationFn: ({ assignmentId, newGradeId }: { assignmentId: string; newGradeId: string }) =>
      studentsService.updateStudentGradeAssignment(assignmentId, newGradeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const removeGradeAssignmentMutation = useMutation({
    mutationFn: (assignmentId: string) =>
      studentsService.removeStudentGradeAssignment(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && (!data || newPage <= data.totalPages)) {
      setPage(newPage);
    }
  };

  const handleSearchChange = (term: string) => {
    setSearch(term);
    setPage(1); // Reiniciar a página 1 al cambiar búsqueda
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["students"] });
  };

  return {
    students: data?.students || [],
    total: data?.total || 0,
    page,
    pageSize,
    totalPages: data?.totalPages || 1,
    isLoading,
    isFetching,
    isPlaceholderData,
    error: error ? (error as Error).message : null,
    grades,
    isLoadingGrades,
    addGradeToStudent: addGradeMutation.mutateAsync,
    updateStudentGradeAssignment: updateGradeAssignmentMutation.mutateAsync,
    removeStudentGradeAssignment: removeGradeAssignmentMutation.mutateAsync,
    isMutatingGrade:
      addGradeMutation.isPending ||
      updateGradeAssignmentMutation.isPending ||
      removeGradeAssignmentMutation.isPending,
    setPage: handlePageChange,
    search,
    setSearch: handleSearchChange,
    refreshStudents: handleRefresh,
  };
};
