"use client";

import FormInput from "@/components/ui/FormInput";
import { useExerciseStore } from "../useExerciseStore";
import styles from "./exercise-form.module.css";

const EMPTY_ITEM = { video_url: "", disclaimer: "" };

type Props = {
  id_class: string;
  type: "video_session";
  order_index: number;
};

export default function VideoExerciseForm({ order_index }: Props) {
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
        placeholder="e.g. everyday conversations"
        value={exercise.name}
        onChangeText={(text) => updateField("name", text)}
      />
      <FormInput
        label="Description"
        placeholder="Learn the application of the verb To Be"
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
            label="Youtube Url"
            placeholder="e.g. https://youtube.com/watch?v=..."
            value={item.video_url}
            onChangeText={(text) => updateItem(itemIndex, "video_url", text)}
            multiline
          />
          <FormInput
            label="Disclaimer / Additional Note"
            placeholder="e.g. The video is in English with subtitles"
            value={item.disclaimer}
            onChangeText={(text) => updateItem(itemIndex, "disclaimer", text)}
            multiline
          />
        </div>
      ))}

      <button className={styles.addButton} onClick={addItem}>
        + Add item
      </button>
    </div>
  );
}
