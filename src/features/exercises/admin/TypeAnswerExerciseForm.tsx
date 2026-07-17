"use client";

import FormInput from "@/components/ui/FormInput";
import { useExerciseStore } from "../useExerciseStore";
import styles from "./exercise-form.module.css";

const EMPTY_ITEM = { correct_answer: "", clues: [] as string[], descriptive_text: "" };

type Props = {
  id_class: string;
  type: "type_answer";
  order_index: number;
};

export default function TypeAnswerExerciseForm({ order_index }: Props) {
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
        label="Exercise Title"
        placeholder="e.g. Short Story Analysis"
        value={exercise.name}
        onChangeText={(text) => updateField("name", text)}
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
            label="Descriptive Text"
            placeholder="Instruction or context for this item..."
            value={item.descriptive_text}
            onChangeText={(text) => updateItem(itemIndex, "descriptive_text", text)}
            multiline
          />
          <div className={styles.separator} />
          <FormInput
            label="Correct Answer"
            placeholder="Type the expected response..."
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
