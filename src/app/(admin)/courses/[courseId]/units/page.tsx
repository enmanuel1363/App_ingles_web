"use client";

import UnitsPage from "@/features/units/UnitsPage";
import { useParams, useSearchParams } from "next/navigation";

export default function UnitsRoute() {
  const params = useParams<{ courseId: string }>();
  const searchParams = useSearchParams();
  const courseTitle = searchParams.get("courseTitle") || undefined;

  return <UnitsPage courseId={params.courseId} courseTitle={courseTitle} />;
}
