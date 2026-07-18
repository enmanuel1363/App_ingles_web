"use client";

import FormInput from "@/components/ui/FormInput";
import { useState } from "react";
import { useExerciseStore } from "../useExerciseStore";
import styles from "./exercise-form.module.css";

const EMPTY_ITEM = { phrase: "", correct_answer: "", possible_answers: [] as string[] };

type Props = {
  id_class: string;
  type: "reading_quiz";
  order_index: number;
};

export default function ReadExerciseForm({ order_index }: Props) {
  const { data, updateExercise } = useExerciseStore();
  const exercise = data[order_index] || {
    name: "",
    description: "",
    content: { items: [{ ...EMPTY_ITEM }] },
  };

  const items = exercise.content?.items || [EMPTY_ITEM];
  const [inputValues, setInputValues] = useState<Record<number, string>>({});

  const updateField = (field: string, value: any) => {
    updateExercise(order_index, { ...exercise, [field]: value });
  };

  const updateContent = (field: string, value: any) => {
    updateExercise(order_index, {
      ...exercise,
      content: { ...exercise.content, [field]: value },
    });
  };

  const updateItem = (itemIndex: number, field: string, value: any) => {
    const newItems = items.map((item: any, i: number) =>
      i === itemIndex ? { ...item, [field]: value } : item,
    );
    updateContent("items", newItems);
  };

  const addItem = () => updateContent("items", [...items, { ...EMPTY_ITEM }]);

  const removeItem = (itemIndex: number) => {
    if (items.length <= 1) return;
    updateContent(
      "items",
      items.filter((_: any, i: number) => i !== itemIndex),
    );
  };

  const handleAddAnswer = (text: string, itemIndex: number) => {
    if (text.includes(",")) {
      const parts = text.split(",");
      const lastPart = parts.pop() || "";
      const newAnswers = parts
        .map((p) => p.trim())
        .filter((p) => p !== "" && !items[itemIndex].possible_answers?.includes(p));

      if (newAnswers.length > 0) {
        updateItem(itemIndex, "possible_answers", [
          ...(items[itemIndex].possible_answers || []),
          ...newAnswers,
        ]);
      }
      setInputValues((prev) => ({ ...prev, [itemIndex]: lastPart }));
    } else {
      setInputValues((prev) => ({ ...prev, [itemIndex]: text }));
    }
  };

  const removeAnswer = (itemIndex: number, answerIdx: number) => {
    updateItem(
      itemIndex,
      "possible_answers",
      items[itemIndex].possible_answers.filter((_: any, i: number) => i !== answerIdx),
    );
  };

  return (
    <div className={styles.container}>
      <FormInput
        label="Lesson title"
        placeholder="e.g. Reading Comprehension"
        value={exercise.name}
        onChangeText={(text) => updateField("name", text)}
      />
      <FormInput
        label="Description"
        placeholder="e.g. Read the phrase and choose the correct answer"
        value={exercise.description}
        onChangeText={(text) => updateField("description", text)}
      />

      {items.map((item: any, itemIndex: number) => (
        <div key={itemIndex} className={styles.itemContainer}>
          <div className={styles.itemHeader}>
            <span className={styles.itemTitle}>Item {itemIndex + 1}</span>
            {items.length > 1 && (
              <button
                className={styles.removeButton}
                onClick={() => removeItem(itemIndex)}
              >
                ✕
              </button>
            )}
          </div>

          <FormInput
            label="Phrase"
            placeholder="e.g. The cat ___ on the mat"
            value={item.phrase || ""}
            onChangeText={(text) => updateItem(itemIndex, "phrase", text)}
          />
          <FormInput
            label="Correct answer"
            placeholder="e.g. sat"
            value={item.correct_answer}
            onChangeText={(text) => updateItem(itemIndex, "correct_answer", text)}
          />

          <div className={styles.section}>
            <label className={styles.sectionLabel}>Possible answers</label>
            <div className={styles.pillsContainer}>
              {item.possible_answers?.map((answer: string, idx: number) => (
                <div key={idx} className={styles.pill}>
                  <span>{answer}</span>
                  <button
                    className={styles.pillRemove}
                    onClick={() => removeAnswer(itemIndex, idx)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <FormInput
              placeholder="Write the answers and separate them with commas. ( , )"
              value={inputValues[itemIndex] || ""}
              onChangeText={(text) => handleAddAnswer(text, itemIndex)}
              multiline
            />
          </div>
        </div>
      ))}

      <button className={styles.addButton} onClick={addItem}>
        + Add item
      </button>
    </div>
  );
}
