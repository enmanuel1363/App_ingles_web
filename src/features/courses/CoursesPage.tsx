"use client";

import styles from "./CoursesPage.module.css";
import CourseCard from "./CourseCard";
import CreateCourseCard from "./CreateCourseCard";
import { useCourses } from "./useCourses";

export default function CoursesPage() {
  const { courses, isLoading, error } = useCourses();

  return (
    <div>
      <div className={styles.section}>
        <h1 className={styles.sectionTitle}>My Classes</h1>
        <p className={styles.sectionSubtitle}>
          Continue with your academic progress
        </p>
      </div>

      <div className={styles.grid}>
        <CreateCourseCard />

        {isLoading && courses.length === 0 ? (
          <div className={styles.centered}>Loading your classes...</div>
        ) : error && courses.length === 0 ? (
          <div className={styles.centered}>
            <p className={styles.errorText}>Error loading class: {error}</p>
          </div>
        ) : (
          courses.map((item) => (
            <CourseCard
              key={item.id}
              id={item.id}
              title={item.name}
              grade={item.grade?.abbreviation || "N/A"}
              students={item.students_count || 0}
            />
          ))
        )}

        {!isLoading && courses.length === 0 && !error && (
          <div className={styles.centered}>
            <p className={styles.emptyText}>No classes available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
