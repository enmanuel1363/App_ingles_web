import AddExercisesPage from "@/features/exercises/components/AddExercisesPage";

type Params = Promise<{ classId: string }>;

export default async function ExercisesRoute({
  params,
}: {
  params: Params;
}) {
  const resolvedParams = await params;
  return <AddExercisesPage classId={resolvedParams.classId} />;
}
