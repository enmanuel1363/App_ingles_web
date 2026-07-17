"use client";

import { useRouter } from "next/navigation";
import styles from "./CourseCard.module.css";
import GradeIcon from "./GradeIcon";

type Props = {
  id: string;
  title: string;
  grade: string;
  students: number;
};

export default function CourseCard({ id, title, grade, students }: Props) {
  const router = useRouter();

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <p className={styles.cardTitle}>{title}</p>
          <p className={styles.cardGrade}>{grade}</p>
        </div>
        <GradeIcon grade={grade} />
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.avatarGroup}>
          <div className={styles.avatar} />
          <div className={`${styles.avatar} ${styles.avatar2}`} />
          <div className={`${styles.avatar} ${styles.avatarCount}`}>
            <span className={styles.countText}>+{students}</span>
          </div>
        </div>

        <button
          className={styles.viewButton}
          onClick={() =>
            router.push(
              `/courses/${id}/units?courseTitle=${encodeURIComponent(title)}`,
            )
          }
        >
          view class ›
        </button>
      </div>
    </div>
  );
}
