import { supabase } from "@/lib/supabase";
import {
  StudentProfile,
  StudentsQueryParams,
  StudentsResponse,
  Grade,
  StudentGradeAssignment,
} from "../students.types";

export const studentsService = {
  async getStudents({
    page = 1,
    pageSize = 10,
    search = "",
  }: StudentsQueryParams): Promise<StudentsResponse> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("profiles")
      .select(
        `
        id,
        full_name,
        name,
        last_name,
        email,
        edad,
        avatar_url,
        is_premium,
        created_at,
        grade_student (
          id,
          id_grade,
          enrollment_date,
          grade:id_grade (
            id,
            name,
            abbreviation
          )
        ),
        class_student (
          id,
          is_completed
        )
      `,
        { count: "exact" }
      )
      .eq("role", "student")
      .order("full_name", { ascending: true })
      .range(from, to);

    if (search && search.trim()) {
      const term = search.trim();
      query = query.or(`full_name.ilike.%${term}%,name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%`);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error("Error fetching students:", error);
      throw error;
    }

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const students: StudentProfile[] = (data || []).map((row: any) => {
      // Extract all grade assignments for the student
      const gradesList: StudentGradeAssignment[] = Array.isArray(row.grade_student)
        ? row.grade_student
            .filter((gs: any) => gs && (gs.grade || gs.id_grade))
            .map((gs: any) => ({
              id: gs.id,
              gradeId: gs.id_grade,
              gradeName: gs.grade?.name || "No grade assigned",
              gradeAbbreviation: gs.grade?.abbreviation || null,
              enrollmentDate: gs.enrollment_date,
            }))
        : [];

      // Calculate completed lessons
      const completedLessonsCount = Array.isArray(row.class_student)
        ? row.class_student.filter((cs: any) => cs.is_completed === true).length
        : 0;

      // Full student name
      const fullName = (row.full_name && row.full_name.trim().length > 0)
        ? row.full_name.trim()
        : `${row.name || ""} ${row.last_name || ""}`.trim() || "Student";

      return {
        id: row.id,
        fullName,
        name: row.name,
        lastName: row.last_name,
        email: row.email,
        edad: row.edad ?? null,
        avatarUrl: row.avatar_url,
        grades: gradesList,
        completedLessonsCount,
        isPremium: Boolean(row.is_premium),
        createdAt: row.created_at,
      };
    });

    return {
      students,
      total,
      page,
      pageSize,
      totalPages,
    };
  },

  async getAvailableGrades(): Promise<Grade[]> {
    const { data, error } = await supabase
      .from("grade")
      .select("id, name, abbreviation")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching available grades:", error);
      throw error;
    }

    return data || [];
  },

  // 1. Add a new grade assignment to a student
  async addGradeToStudent(studentId: string, gradeId: string): Promise<void> {
    const { error } = await supabase
      .from("grade_student")
      .insert({
        id_student_profile: studentId,
        id_grade: gradeId,
      });

    if (error) {
      console.error("Error assigning new grade to student:", error);
      throw error;
    }
  },

  // 2. Change a specific grade assignment by its grade_student ID
  async updateStudentGradeAssignment(assignmentId: string, newGradeId: string): Promise<void> {
    const { error } = await supabase
      .from("grade_student")
      .update({
        id_grade: newGradeId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", assignmentId);

    if (error) {
      console.error("Error updating grade assignment:", error);
      throw error;
    }
  },

  // 3. Remove a specific grade assignment from grade_student
  async removeStudentGradeAssignment(assignmentId: string): Promise<void> {
    const { error } = await supabase
      .from("grade_student")
      .delete()
      .eq("id", assignmentId);

    if (error) {
      console.error("Error removing grade assignment:", error);
      throw error;
    }
  },
};
