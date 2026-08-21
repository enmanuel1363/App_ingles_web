import CoursesPage from "@/features/courses/components/CoursesPage";
import { getCoursesServer } from "@/features/courses/services/courses.server";

export default async function CoursesRoute() {
  const initialCourses = await getCoursesServer();
  return <CoursesPage initialCourses={initialCourses} />;
}

