import ClassesPage from "@/features/classes/components/ClassesPage";

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

  return (
    <ClassesPage
      courseId={resolvedParams.courseId}
      unitId={resolvedParams.unitId}
      unitName={resolvedSearchParams.unitName}
      unitOrder={resolvedSearchParams.unitOrder}
    />
  );
}
