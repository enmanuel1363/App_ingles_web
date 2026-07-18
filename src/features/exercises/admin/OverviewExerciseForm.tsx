"use client";

import FormInput from "@/components/ui/FormInput";
import { useState } from "react";
import { useExerciseStore } from "../useExerciseStore";
import formStyles from "./exercise-form.module.css";
import styles from "./OverviewExerciseForm.module.css";

type VocabWord = { word: string; translation: string };
type Item = { words: VocabWord[] };

type Props = {
  id_class: string;
  type: "overview_session";
  order_index: number;
};

export default function OverviewExerciseForm({ order_index }: Props) {
  const { data, updateExercise } = useExerciseStore();
  const exercise = data[order_index] || {
    name: "",
    description: "",
    content: { items: [{ words: [] }] },
  };

  const items: Item[] = exercise.content?.items || [];
  const [newWord, setNewWord] = useState("");
  const [newTranslation, setNewTranslation] = useState("");

  const updateField = (field: string, value: any) => {
    updateExercise(order_index, { ...exercise, [field]: value });
  };

  const updateContent = (field: string, value: any) => {
    updateExercise(order_index, {
      ...exercise,
      content: { ...exercise.content, [field]: value },
    });
  };

  const addItem = () => updateContent("items", [...items, { words: [] }]);

  const removeItem = (index: number) =>
    updateContent(
      "items",
      items.filter((_, i) => i !== index),
    );

  const addWordToItem = (itemIndex: number) => {
    const w = newWord.trim();
    const t = newTranslation.trim();
    if (!w || !t) return;

    const updated = items.map((item, i) =>
      i === itemIndex
        ? { ...item, words: [...item.words, { word: w, translation: t }] }
        : item,
    );
    updateContent("items", updated);
    setNewWord("");
    setNewTranslation("");
  };

  const removeWordFromItem = (itemIndex: number, wordIndex: number) => {
    const updated = items.map((item, i) =>
      i === itemIndex
        ? { ...item, words: item.words.filter((_, j) => j !== wordIndex) }
        : item,
    );
    updateContent("items", updated);
  };

  return (
    <div className={formStyles.container}>
      <FormInput
        label="Title"
        placeholder="e.g. Animals Vocabulary"
        value={exercise.name}
        onChangeText={(text) => updateField("name", text)}
      />
      <FormInput
        label="Description"
        placeholder="e.g. Learn the names of common animals"
        value={exercise.description}
        onChangeText={(text) => updateField("description", text)}
        multiline
      />

      <div className={formStyles.section}>
        <label className={formStyles.sectionLabel}>Vocabulary Sections</label>

        {items.length === 0 && (
          <div className={styles.emptyState}>📖 No sections added yet</div>
        )}

        {items.map((item, itemIndex) => (
          <div key={itemIndex} className={formStyles.itemContainer}>
            <div className={formStyles.itemHeader}>
              <div className={styles.itemTitleRow}>
                <span>📖</span>
                <span className={formStyles.itemTitle}>Section {itemIndex + 1}</span>
              </div>
              <button
                className={formStyles.removeButton}
                onClick={() => removeItem(itemIndex)}
              >
                🗑️
              </button>
            </div>

            {item.words.map((word, wordIndex) => (
              <div key={wordIndex} className={styles.wordCard}>
                <div className={styles.wordContent}>
                  <span className={styles.wordText}>{word.word}</span>
                  <span className={styles.translationText}>{word.translation}</span>
                </div>
                <button
                  className={styles.removeIcon}
                  onClick={() => removeWordFromItem(itemIndex, wordIndex)}
                >
                  🗑️
                </button>
              </div>
            ))}

            {item.words.length === 0 && (
              <p className={styles.wordEmptyText}>No words in this section</p>
            )}

            <div className={styles.addWordForm}>
              <div className={styles.addWordRow}>
                <div className={styles.fieldHalf}>
                  <FormInput
                    label="English Word"
                    placeholder="e.g. Dog"
                    value={newWord}
                    onChangeText={setNewWord}
                  />
                </div>
                <div className={styles.fieldHalf}>
                  <FormInput
                    label="Translation"
                    placeholder="e.g. Perro"
                    value={newTranslation}
                    onChangeText={setNewTranslation}
                  />
                </div>
              </div>
              <button
                className={styles.addWordButton}
                onClick={() => addWordToItem(itemIndex)}
                disabled={!newWord.trim() || !newTranslation.trim()}
              >
                + Add Word
              </button>
            </div>
          </div>
        ))}

        <button className={formStyles.addButton} onClick={addItem}>
          + Add item
        </button>
      </div>
    </div>
  );
}
