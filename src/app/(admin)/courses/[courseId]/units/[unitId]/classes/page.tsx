import ClassesPage from "@/features/classes/components/ClassesPage";
import { fetchClassesServer, fetchUnitDetailsServer } from "@/features/classes/services/classes.server";

type Params = Promise<{ courseId: string; unitId: string }>;
type SearchParams = Promise<{ unitName?: string; unitOrder?: string }>;

export default async function ClassesRoute({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Prefetch classes and unit details on the server in parallel
  const [initialClasses, unitDetails] = await Promise.all([
    fetchClassesServer(resolvedParams.unitId),
    (resolvedSearchParams.unitName && resolvedSearchParams.unitOrder)
      ? null
      : fetchUnitDetailsServer(resolvedParams.unitId),
  ]);

  const unitName = resolvedSearchParams.unitName || unitDetails?.name || "";
  const unitOrder = resolvedSearchParams.unitOrder || (unitDetails?.order_index !== undefined ? String(unitDetails.order_index) : "");

  return (
    <ClassesPage
      courseId={resolvedParams.courseId}
      unitId={resolvedParams.unitId}
      unitName={unitName}
      unitOrder={unitOrder}
      initialClasses={initialClasses}
    />
  );
}

