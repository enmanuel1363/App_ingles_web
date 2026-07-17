"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./ClassesPage.module.css";
import ClassCard from "./ClassCard";
import CreateClassModal from "./CreateClassModal";
import { useClasses, useDeleteClass } from "./useClasses";
import { ClassModel } from "./class.types";

type Props = {
  courseId: string;
  unitId: string;
  unitName?: string;
  unitOrder?: string;
};

export default function ClassesPage({ courseId, unitId, unitName, unitOrder }: Props) {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [classToEdit, setClassToEdit] = useState<ClassModel | null>(null);

  const { data, isLoading, error } = useClasses(unitId);
  const { mutateAsync: deleteClassMutation } = useDeleteClass();

  const lessons = data || [];

  const handleAddClass = () => {
    setClassToEdit(null);
    setIsModalVisible(true);
  };

  const handleClassClick = (id: string) => {
    router.push(`/courses/${courseId}/units/${unitId}/classes/${id}/exercises`);
  };

  const handleDeleteClass = async (id: string, className: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${className}"?`,
    );
    if (!confirmed) return;

    try {
      await deleteClassMutation({ classId: id, unitId });
    } catch {
      alert("Failed to delete the class");
    }
  };

  return (
    <div className={styles.main}>
      <button className={styles.backLink} onClick={() => router.back()}>
        ‹ Back to Units
      </button>

      <div className={styles.subHeader}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>
            {unitName ? `Unit ${unitOrder}: ${unitName}` : "Classes created"}
          </h1>
          <div className={styles.badge}>
            <span className={styles.badgeText}>{lessons.length}</span>
          </div>
        </div>
        <button className={styles.addClassButton} onClick={handleAddClass}>
          <span className={styles.addClassText}>Add Class</span>
          <span>+</span>
        </button>
      </div>

      {isLoading ? (
        <div className={styles.center}>Loading lessons...</div>
      ) : error ? (
        <div className={styles.center}>Error loading classes</div>
      ) : (
        <div className={styles.list}>
          {lessons.map((lesson) => (
            <ClassCard
              key={lesson.id}
              id={lesson.id}
              name={lesson.name}
              order_index={lesson.order_index}
              type={lesson.type}
              created_at={lesson.created_at || ""}
              updated_at={lesson.updated_at || ""}
              onPress={handleClassClick}
              onEdit={() => {
                setClassToEdit(lesson);
                setIsModalVisible(true);
              }}
              onDelete={() => handleDeleteClass(lesson.id!, lesson.name)}
            />
          ))}
          {lessons.length === 0 && (
            <div className={styles.center}>No classes created yet.</div>
          )}
        </div>
      )}

      <CreateClassModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setClassToEdit(null);
        }}
        id_unit={unitId}
        nextOrderIndex={lessons.length + 1}
        classToEdit={classToEdit}
      />
    </div>
  );
}
