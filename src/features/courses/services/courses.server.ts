import { createClient } from "@/lib/supabaseServer";
import { CourseWithGrade } from "../course.types";

/**
 * Fetches courses with grades and student counts on the server.
 */
export async function getCoursesServer(): Promise<CourseWithGrade[]> {
  const supabase = await createClient();
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

  if (error) {
    console.error("Error fetching courses on server:", error);
    throw error;
  }

  return (data || []).map((course: any) => ({
    ...course,
    students_count: course.students_count?.[0]?.count || 0,
  }));
}
