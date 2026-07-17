"use client";

import { useEffect, useState } from "react";
import modal from "@/components/ui/modal.module.css";
import { useCourses } from "./useCourses";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function CreateCourseModal({ visible, onClose }: Props) {
  const { grades, createCourse, isLoading } = useCourses();
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sortedGrades = [...grades].sort((a, b) => {
    const numA = parseInt(a.abbreviation) || 0;
    const numB = parseInt(b.abbreviation) || 0;
    return numA - numB;
  });

  useEffect(() => {
    if (visible) {
      setAcademicLevel("");
      setClassName("");
      setDescription("");
      setError(null);
    }
  }, [visible]);

  if (!visible) return null;

  const handleCreate = async () => {
    if (!className.trim() || !academicLevel) {
      setError("Completa el nombre de la clase y selecciona un nivel.");
      return;
    }

    const result = await createCourse(className, academicLevel, description);
    if (result.success) {
      onClose();
    } else {
      setError(result.error || "No se pudo crear el curso");
    }
  };

  return (
    <div className={modal.overlay} onClick={onClose}>
      <div className={modal.modal} onClick={(e) => e.stopPropagation()}>
        <div className={modal.header}>
          <h2 className={modal.title}>New Class</h2>
        </div>

        <div className={modal.field}>
          <label className={modal.label}>Class Name</label>
          <input
            className={modal.input}
            placeholder="e.g. History of Arts"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className={modal.field}>
          <label className={modal.label}>Academic Level</label>
          <select
            className={modal.select}
            value={academicLevel}
            onChange={(e) => setAcademicLevel(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Select a level</option>
            {sortedGrades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
        </div>

        <div className={modal.field}>
          <label className={modal.label}>Description</label>
          <textarea
            className={modal.textarea}
            placeholder="Brief class summary..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {error && <p className={modal.errorText}>{error}</p>}

        <div className={modal.buttonsRow}>
          <button
            className={`${modal.button} ${modal.cancelButton}`}
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className={`${modal.button} ${modal.createButton}`}
            onClick={handleCreate}
            disabled={isLoading}
          >
            {isLoading ? "Creando…" : "Create Class"}
          </button>
        </div>
      </div>
    </div>
  );
}
