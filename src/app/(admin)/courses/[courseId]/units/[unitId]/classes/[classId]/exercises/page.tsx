"use client";

import AddExercisesPage from "@/features/exercises/AddExercisesPage";
import { useParams } from "next/navigation";

export default function ExercisesRoute() {
  const params = useParams<{ classId: string }>();
  return <AddExercisesPage classId={params.classId} />;
}
