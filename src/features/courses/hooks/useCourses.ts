"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { coursesService } from '../services/courses.service';

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
      description?: string | null;
    }) => coursesService.createCourse(newCourse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({
      id,
      course,
    }: {
      id: string;
      course: {
        name?: string;
        id_grade?: string;
        description?: string | null;
      };
    }) => coursesService.updateCourse(id, course),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  const handleCreateCourse = async (
    name: string,
    id_grade: string,
    description?: string | null,
  ) => {
    try {
      await createCourseMutation.mutateAsync({ name, id_grade, description });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message as string };
    }
  };

  const handleUpdateCourse = async (
    id: string,
    course: {
      name?: string;
      id_grade?: string;
      description?: string | null;
    },
  ) => {
    try {
      await updateCourseMutation.mutateAsync({ id, course });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message as string };
    }
  };

  const deleteCourseMutation = useMutation({
    mutationFn: coursesService.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  const handleDeleteCourse = async (id: string) => {
    try {
      await deleteCourseMutation.mutateAsync(id);
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
    updateCourse: handleUpdateCourse,
    deleteCourse: handleDeleteCourse,
    refreshCourses: () =>
      queryClient.invalidateQueries({ queryKey: ["courses"] }),
  };
};
