export type Grade = {
  id: string;
  name: string;
  abbreviation: string;
  created_at: string;
  updated_at: string;
};

export type Course = {
  id: string;
  id_grade: string;
  name: string;
  created_at: string;
  updated_at: string;
  description?: string;
};

export type CourseWithGrade = Course & {
  grade?: Grade;
  students_count?: number;
};
