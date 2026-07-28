import { supabase } from "@/lib/supabase";
import { Course, CourseWithGrade, Grade } from '../course.types';

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
    const { data, error } = await supabase
      .from("course")
      .insert(course)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
