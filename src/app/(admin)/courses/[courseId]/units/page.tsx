import UnitsPage from "@/features/units/components/UnitsPage";
import { fetchUnitsServer, fetchCourseTitleServer } from "@/features/units/services/units.server";

type Params = Promise<{ courseId: string }>;
type SearchParams = Promise<{ courseTitle?: string }>;

export default async function UnitsRoute({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Prefetch units data and course title on the server
  const [initialUnits, courseTitle] = await Promise.all([
    fetchUnitsServer(resolvedParams.courseId),
    resolvedSearchParams.courseTitle || fetchCourseTitleServer(resolvedParams.courseId),
  ]);

  return (
    <UnitsPage
      courseId={resolvedParams.courseId}
      courseTitle={courseTitle || undefined}
      initialUnits={initialUnits}
    />
  );
}

