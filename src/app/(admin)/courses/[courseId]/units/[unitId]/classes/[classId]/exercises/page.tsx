"use client";

import AddExercisesPage from "@/features/exercises/components/AddExercisesPage";
import { useParams } from "next/navigation";

export default function ExercisesRoute() {
  const params = useParams<{ classId: string }>();
  return <AddExercisesPage classId={params.classId} />;
}
