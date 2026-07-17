"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { coursesService } from "./courses.service";

export const useCourses = () => {
  const queryClient = useQueryClient();

  const {
    data: courses = [],
    isLoading: isLoadingCourses,
    error: coursesError,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: coursesService.getCourses,
  });

  const {
    data: grades = [],
    isLoading: isLoadingGrades,
    error: gradesError,
  } = useQuery({
    queryKey: ["grades"],
    queryFn: coursesService.getGrades,
  });

  const createCourseMutation = useMutation({
    mutationFn: (newCourse: {
      name: string;
      id_grade: string;
      description?: string;
    }) => coursesService.createCourse(newCourse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  const handleCreateCourse = async (
    name: string,
    id_grade: string,
    description?: string,
  ) => {
    try {
      await createCourseMutation.mutateAsync({ name, id_grade, description });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message as string };
    }
  };

  return {
    courses,
    grades,
    isLoading: isLoadingCourses || isLoadingGrades,
    error: coursesError?.message || gradesError?.message || null,
    createCourse: handleCreateCourse,
    refreshCourses: () =>
      queryClient.invalidateQueries({ queryKey: ["courses"] }),
  };
};
