"use client";

import { lesson_type } from "@/types/global.types";
import { useState } from "react";
import styles from "./CreateExercise.module.css";
import { EXERCISE_COMPONENTS } from "./exercise-components";
import {
  EXERCISE_CATEGORIES,
  EXERCISE_DEFAULT_CONTENT,
  EXERCISE_DEFAULT_DESCRIPTIONS,
  lessonTypeOptions,
} from "./exercise-constants";
import { useExerciseStore } from "./useExerciseStore";

type Props = {
  index: number;
  moveUp: () => void;
  moveDown: () => void;
  onRemove?: () => void;
};

export default function CreateExercise({ index, moveUp, moveDown, onRemove }: Props) {
  const { data, updateExercise } = useExerciseStore();
  const exerciseData = data[index];
  const type = exerciseData?.type || "complete_word";

  const [showTypePicker, setShowTypePicker] = useState(false);

  const selectedType = lessonTypeOptions.find((opt) => opt.value === type);
  const ExerciseForm = EXERCISE_COMPONENTS[type];

  const handleTypeChange = (newType: lesson_type) => {
    updateExercise(index, {
      ...exerciseData,
      type: newType,
      description: EXERCISE_DEFAULT_DESCRIPTIONS[newType] || "",
      content: EXERCISE_DEFAULT_CONTENT[newType] || {},
    });
    setShowTypePicker(false);
  };

  return (
    <div className={styles.slot}>
      <div className={styles.headSection}>
        <span className={styles.selectionText}>Select type</span>
        <div className={styles.actionsSection}>
          <button className={styles.iconButton} onClick={moveUp} title="Move up">
            ↑
          </button>
          <button className={styles.iconButton} onClick={moveDown} title="Move down">
            ↓
          </button>
          <button className={styles.iconButton} onClick={onRemove} title="Remove">
            🗑️
          </button>
        </div>
      </div>

      <button
        className={`${styles.picker} ${showTypePicker ? styles.pickerActive : ""}`}
        onClick={() => setShowTypePicker(!showTypePicker)}
      >
        <div className={styles.pickerContent}>
          {selectedType ? (
            <div className={styles.selectedTypeRow}>
              <span>{selectedType.icon}</span>
              <div>
                <div className={styles.selectedTypeText}>{selectedType.label}</div>
                <div className={styles.category}>
                  {EXERCISE_CATEGORIES[selectedType.value]}
                </div>
              </div>
            </div>
          ) : (
            <span>Select a type</span>
          )}
          <span>{showTypePicker ? "▲" : "▼"}</span>
        </div>
      </button>

      {showTypePicker && (
        <div className={styles.optionsContainer}>
          {lessonTypeOptions.map((option) => (
            <button
              key={option.value}
              className={`${styles.optionItem} ${
                type === option.value ? styles.optionItemActive : ""
              }`}
              onClick={() => handleTypeChange(option.value)}
            >
              <div className={styles.optionRow}>
                <span>{option.icon}</span>
                <div>
                  <div className={styles.optionName}>{option.label}</div>
                  <div className={styles.category}>
                    {EXERCISE_CATEGORIES[option.value]}
                  </div>
                </div>
              </div>
              {type === option.value && <span>✓</span>}
            </button>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <ExerciseForm id_class={exerciseData?.id_class || ""} type={type} order_index={index} />
      </div>
    </div>
  );
}
