export interface Grade {
  id: string;
  name: string;
  abbreviation: string;
}

export interface StudentGradeAssignment {
  id: string; // ID del registro en grade_student
  gradeId: string;
  gradeName: string;
  gradeAbbreviation?: string | null;
  enrollmentDate?: string | null;
}

export interface StudentProfile {
  id: string;
  fullName: string;
  name?: string | null;
  lastName?: string | null;
  email?: string | null;
  edad: number | null;
  avatarUrl?: string | null;
  grades: StudentGradeAssignment[];
  completedLessonsCount: number;
  isPremium: boolean;
  createdAt?: string;
}

export interface StudentsQueryParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface StudentsResponse {
  students: StudentProfile[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
