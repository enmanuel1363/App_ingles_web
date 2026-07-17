"use client";

import FormInput from "@/components/ui/FormInput";
import { useState } from "react";
import { useExerciseStore } from "../useExerciseStore";
import styles from "./exercise-form.module.css";

const EMPTY_ITEM = { sentence: "", correct_answer: "", possible_answers: [] as string[] };

type Props = {
  id_class: string;
  type: "complete_word";
  order_index: number;
};

export default function CompleteWordExerciseForm({ order_index }: Props) {
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
        label="Exercise title"
        placeholder="e.g. Complete the sentence"
        value={exercise.name}
        onChangeText={(text) => updateField("name", text)}
      />
      <FormInput
        label="Description"
        placeholder="e.g. Fill in the blank with the correct word"
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
            label="Sentence text"
            placeholder="e.g. I ____ to the park"
            value={item.sentence}
            onChangeText={(text) => updateItem(itemIndex, "sentence", text)}
          />
          <FormInput
            label="Correct answer"
            placeholder="e.g. went"
            value={item.correct_answer}
            onChangeText={(text) => updateItem(itemIndex, "correct_answer", text)}
          />

          <div className={styles.section}>
            <label className={styles.sectionLabel}>Posibles respuestas</label>
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
              placeholder="Type an answer and separate by comma ( , )"
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
