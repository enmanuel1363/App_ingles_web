"use client";

import { useEffect, useState } from "react";
import modal from "@/components/ui/modal.module.css";
import { useCreateUnit, useUnits } from "./useUnits";

type Props = {
  visible: boolean;
  onClose: () => void;
  courseId: string;
};

type DifficultyLevel = "low" | "medium" | "hard";

const LEVEL_LABELS: Record<DifficultyLevel, string> = {
  low: "Bajo",
  medium: "Medio",
  hard: "Alto",
};

const LEVEL_ORDER: DifficultyLevel[] = ["low", "medium", "hard"];

export default function CreateUnitModal({ visible, onClose, courseId }: Props) {
  const { mutate: createUnit, isPending } = useCreateUnit();
  const { data: units } = useUnits(courseId);

  const [level, setLevel] = useState<DifficultyLevel>("low");
  const [unitName, setUnitName] = useState("");
  const [orderIndex, setOrderIndex] = useState("1");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (visible && units) {
      setOrderIndex((units.length + 1).toString());
      setHasError(false);
      setUnitName("");
      setLevel("low");
    }
  }, [visible, units]);

  if (!visible) return null;

  const handleOrderIndexChange = (text: string) => {
    setOrderIndex(text);
    setHasError(text !== "" && !/^\d+$/.test(text));
  };

  const handleCreate = () => {
    if (!unitName.trim() || hasError || !orderIndex) return;

    createUnit(
      {
        id_course: courseId,
        name: unitName,
        order_index: parseInt(orderIndex) || (units?.length || 0) + 1,
        difficulty: level,
      },
      { onSuccess: onClose },
    );
  };

  const levelClass = {
    low: modal.difficultyLow,
    medium: modal.difficultyMedium,
    hard: modal.difficultyHard,
  }[level];

  return (
    <div className={modal.overlay} onClick={onClose}>
      <div className={modal.modal} onClick={(e) => e.stopPropagation()}>
        <div className={modal.header}>
          <h2 className={modal.title}>Create New Unit</h2>
        </div>

        <div className={modal.field}>
          <label className={modal.label}>Unit Name</label>
          <input
            className={modal.input}
            placeholder="e.g. History of Arts"
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
          />
        </div>

        <div className={modal.field}>
          <label className={modal.label}>Order of unit</label>
          <input
            className={`${modal.input} ${hasError ? modal.inputError : ""}`}
            placeholder="Ej: 1"
            value={orderIndex}
            onChange={(e) => handleOrderIndexChange(e.target.value)}
            inputMode="numeric"
          />
          {hasError && (
            <p className={modal.errorText}>
              * Solo se permiten números en este campo
            </p>
          )}
        </div>

        <div className={modal.field}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className={modal.label}>Difficulty</span>
            <span className={modal.label}>{`Nivel ${LEVEL_LABELS[level]}`}</span>
          </div>
          <div className={modal.difficultyRow}>
            {LEVEL_ORDER.map((option) => (
              <button
                key={option}
                type="button"
                className={`${modal.difficultyButton} ${
                  LEVEL_ORDER.indexOf(level) >= LEVEL_ORDER.indexOf(option)
                    ? levelClass
                    : ""
                }`}
                onClick={() => setLevel(option)}
              />
            ))}
          </div>
          <p className={modal.disclaimer}>
            Select the difficulty level of the class
          </p>
        </div>

        <div className={modal.buttonsRow}>
          <button
            className={`${modal.button} ${modal.cancelButton}`}
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            className={`${modal.button} ${modal.createButton}`}
            onClick={handleCreate}
            disabled={isPending}
          >
            {isPending ? "Creando…" : "Create class"}
          </button>
        </div>
      </div>
    </div>
  );
}
