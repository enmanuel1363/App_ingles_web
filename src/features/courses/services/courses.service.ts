import { supabase } from "@/lib/supabase";
import { Course, CourseWithGrade, Grade } from '../course.types';
import { createCourseAction, updateCourseAction, deleteCourseAction } from '../courses.actions';

export const coursesService = {
  async getGrades(): Promise<Grade[]> {
    const { data, error } = await supabase
      .from("grade")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getCourses(): Promise<CourseWithGrade[]> {
    const { data, error } = await supabase
      .from("course")
      .select(
        `
        *,
        grade:grade(*),
        students_count:course_student(count)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((course: any) => ({
      ...course,
      students_count: course.students_count?.[0]?.count || 0,
    }));
  },

  async createCourse(
    course: Omit<Course, "id" | "created_at" | "updated_at">,
  ): Promise<Course> {
    const result = await createCourseAction(course);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data!;
  },

  async updateCourse(
    id: string,
    course: Partial<Omit<Course, "id" | "created_at" | "updated_at">>,
  ): Promise<Course> {
    const result = await updateCourseAction(id, course);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data!;
  },

  async deleteCourse(id: string): Promise<void> {
    const result = await deleteCourseAction(id);
    if (!result.success) {
      throw new Error(result.error);
    }
  },
};

