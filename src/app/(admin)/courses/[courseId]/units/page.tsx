import UnitsPage from "@/features/units/components/UnitsPage";

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

  return (
    <UnitsPage
      courseId={resolvedParams.courseId}
      courseTitle={resolvedSearchParams.courseTitle}
    />
  );
}
