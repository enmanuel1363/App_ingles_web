"use client";

import { useRouter } from "next/navigation";
import styles from "./UnitsPage.module.css";
import CreateUnitCard from "./CreateUnitCard";
import UnitCard from "./UnitCard";
import { useUnits } from "./useUnits";
import { Unit } from "./unit.types";

type Props = {
  courseId: string;
  courseTitle?: string;
};

export default function UnitsPage({ courseId, courseTitle }: Props) {
  const router = useRouter();
  const { data, isLoading } = useUnits(courseId);
  const units = data || [];

  const goToClasses = (item: Unit) => {
    router.push(
      `/courses/${courseId}/units/${item.id}/classes?unitName=${encodeURIComponent(
        item.name,
      )}&unitOrder=${item.order_index}`,
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <button className={styles.backLink} onClick={() => router.push("/courses")}>
          ‹ My Classes
        </button>
      </div>
      <h1 className={styles.pageTitle}>
        {courseTitle ? `${courseTitle} Units` : "Units"}
      </h1>

      <div className={styles.list} style={{ marginTop: 16 }}>
        <CreateUnitCard courseId={courseId} />

        {isLoading ? (
          <div className={styles.loaderContainer}>loading class...</div>
        ) : units.length === 0 ? (
          <div className={styles.loaderContainer}>No units available.</div>
        ) : (
          units.map((item) => (
            <UnitCard
              key={item.id}
              order={item.order_index}
              name={item.name}
              difficulty={item.difficulty}
              onPress={() => goToClasses(item)}
            />
          ))
        )}
      </div>
    </div>
  );
}
