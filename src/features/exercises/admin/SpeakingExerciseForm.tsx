"use client";

import FormInput from "@/components/ui/FormInput";
import { useExerciseStore } from "../useExerciseStore";
import styles from "./exercise-form.module.css";

const EMPTY_ITEM = { correct_answer: "" };

type Props = {
  id_class: string;
  type: "speak";
  order_index: number;
};

export default function SpeakingExerciseForm({ order_index }: Props) {
  const { data, updateExercise } = useExerciseStore();
  const exercise = data[order_index] || {
    name: "",
    description: "",
    content: { items: [{ ...EMPTY_ITEM }] },
  };

  const items = exercise.content?.items || [EMPTY_ITEM];

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

  return (
    <div className={styles.container}>
      <FormInput
        label="Title of the exercise"
        placeholder="e.g. Pronunciation: Verb To Be"
        value={exercise.name}
        onChangeText={(text) => updateField("name", text)}
      />
      <FormInput
        label="Description / Word to repeat"
        placeholder="e.g. Repeat the word: Apple"
        value={exercise.description}
        onChangeText={(text) => updateField("description", text)}
        multiline
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
            label="Correct answer (Comparison)"
            placeholder="e.g. apple"
            value={item.correct_answer}
            onChangeText={(text) => updateItem(itemIndex, "correct_answer", text)}
          />
        </div>
      ))}

      <button className={styles.addButton} onClick={addItem}>
        + Add item
      </button>
    </div>
  );
}
