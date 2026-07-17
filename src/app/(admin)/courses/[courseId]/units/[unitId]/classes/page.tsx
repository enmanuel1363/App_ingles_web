"use client";

import ClassesPage from "@/features/classes/ClassesPage";
import { useParams, useSearchParams } from "next/navigation";

export default function ClassesRoute() {
  const params = useParams<{ courseId: string; unitId: string }>();
  const searchParams = useSearchParams();
  const unitName = searchParams.get("unitName") || undefined;
  const unitOrder = searchParams.get("unitOrder") || undefined;

  return (
    <ClassesPage
      courseId={params.courseId}
      unitId={params.unitId}
      unitName={unitName}
      unitOrder={unitOrder}
    />
  );
}
