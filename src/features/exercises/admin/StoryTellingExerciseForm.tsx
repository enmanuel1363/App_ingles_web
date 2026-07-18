"use client";

import FormInput from "@/components/ui/FormInput";
import { useRef, useState } from "react";
import { useExerciseStore } from "../useExerciseStore";
import formStyles from "./exercise-form.module.css";
import styles from "./StoryTellingExerciseForm.module.css";

type AnswerOption = { text: string; isCorrect: boolean };
type QA = { question: string; options: AnswerOption[] };
type Item = { cover_image: string | File; story: string; questions: QA[] };

const EMPTY_ITEM: Item = { cover_image: "", story: "", questions: [] };

type Props = {
  id_class: string;
  type: "audio_session";
  order_index: number;
};

export default function StoryTellingExerciseForm({ order_index }: Props) {
  const { data, updateExercise } = useExerciseStore();
  const exercise = data[order_index] || {
    name: "",
    description: "",
    content: { items: [{ ...EMPTY_ITEM }] },
  };

  const items: Item[] = exercise.content?.items || [EMPTY_ITEM];
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const [newQuestions, setNewQuestions] = useState<Record<number, string>>({});
  const [newOptionsMap, setNewOptionsMap] = useState<Record<number, AnswerOption[]>>({});

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
    const newItems = items.map((item, i) =>
      i === itemIndex ? { ...item, [field]: value } : item,
    );
    updateContent("items", newItems);
  };

  const addItem = () => updateContent("items", [...items, { ...EMPTY_ITEM }]);

  const removeItem = (itemIndex: number) => {
    if (items.length <= 1) return;
    updateContent(
      "items",
      items.filter((_, i) => i !== itemIndex),
    );
  };

  const getNewQuestion = (itemIndex: number) => newQuestions[itemIndex] || "";
  const getNewOptions = (itemIndex: number) =>
    newOptionsMap[itemIndex] || [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
    ];

  const setNewQuestion = (itemIndex: number, value: string) =>
    setNewQuestions((prev) => ({ ...prev, [itemIndex]: value }));

  const setNewOptions = (itemIndex: number, options: AnswerOption[]) =>
    setNewOptionsMap((prev) => ({ ...prev, [itemIndex]: options }));

  const resetNewQA = (itemIndex: number) => {
    setNewQuestions((prev) => ({ ...prev, [itemIndex]: "" }));
    setNewOptionsMap((prev) => ({
      ...prev,
      [itemIndex]: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
      ],
    }));
  };

  const handleCoverChange = (itemIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) updateItem(itemIndex, "cover_image", file);
  };

  const previewSrc = (cover: string | File) =>
    typeof cover === "string" ? cover : URL.createObjectURL(cover);

  const handleOptionText = (itemIndex: number, index: number, text: string) => {
    const opts = getNewOptions(itemIndex);
    setNewOptions(
      itemIndex,
      opts.map((opt, i) => (i === index ? { ...opt, text } : opt)),
    );
  };

  const handleSetCorrect = (itemIndex: number, index: number) => {
    const opts = getNewOptions(itemIndex);
    setNewOptions(
      itemIndex,
      opts.map((opt, i) => ({ ...opt, isCorrect: i === index })),
    );
  };

  const addOption = (itemIndex: number) =>
    setNewOptions(itemIndex, [...getNewOptions(itemIndex), { text: "", isCorrect: false }]);

  const removeOption = (itemIndex: number, index: number) => {
    const opts = getNewOptions(itemIndex);
    if (opts.length <= 2) return;
    const updated = opts.filter((_, i) => i !== index);
    const hasCorrect = updated.some((o) => o.isCorrect);
    setNewOptions(
      itemIndex,
      hasCorrect ? updated : updated.map((o, i) => ({ ...o, isCorrect: i === 0 })),
    );
  };

  const canAdd = (itemIndex: number) => {
    const question = getNewQuestion(itemIndex);
    if (!question.trim()) return false;
    const filled = getNewOptions(itemIndex).filter((o) => o.text.trim() !== "");
    if (filled.length < 2) return false;
    return getNewOptions(itemIndex).some((o) => o.isCorrect && o.text.trim() !== "");
  };

  const addQA = (itemIndex: number) => {
    if (!canAdd(itemIndex)) return;

    const filledOptions = getNewOptions(itemIndex)
      .filter((o) => o.text.trim() !== "")
      .map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect }));

    const currentQA = items[itemIndex]?.questions || [];
    updateItem(itemIndex, "questions", [
      ...currentQA,
      { question: getNewQuestion(itemIndex).trim(), options: filledOptions },
    ]);
    resetNewQA(itemIndex);
  };

  const removeQA = (itemIndex: number, qIndex: number) => {
    const currentQA = items[itemIndex]?.questions || [];
    updateItem(
      itemIndex,
      "questions",
      currentQA.filter((_, i) => i !== qIndex),
    );
  };

  return (
    <div className={formStyles.container}>
      <FormInput
        label="Title"
        placeholder="e.g. The Dog and the Cat"
        value={exercise.name}
        onChangeText={(text) => updateField("name", text)}
      />
      <FormInput
        label="Description"
        placeholder="e.g. Read the story and answer the questions"
        value={exercise.description}
        onChangeText={(text) => updateField("description", text)}
        multiline
      />

      {items.map((item, itemIndex) => {
        const questions = item.questions || [];

        return (
          <div key={itemIndex} className={formStyles.itemContainer}>
            <div className={formStyles.itemHeader}>
              <span className={formStyles.itemTitle}>Item {itemIndex + 1}</span>
              {items.length > 1 && (
                <button
                  className={formStyles.removeButton}
                  onClick={() => removeItem(itemIndex)}
                >
                  ✕
                </button>
              )}
            </div>

            <div className={styles.coverSection}>
              <label className={formStyles.sectionLabel}>Cover Image</label>
              <p className={styles.hint}>Shown above the story text (16:9 recommended)</p>

              {item.cover_image ? (
                <div className={styles.coverPreviewContainer}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewSrc(item.cover_image)}
                    alt="cover"
                    className={styles.coverPreview}
                  />
                  <button
                    className={styles.removeCoverBtn}
                    onClick={() => updateItem(itemIndex, "cover_image", "")}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  className={styles.coverPlaceholder}
                  onClick={() => fileInputRefs.current[itemIndex]?.click()}
                >
                  <span style={{ fontSize: 32 }}>🖼️</span>
                  <span className={styles.coverPlaceholderText}>
                    Tap to select cover image
                  </span>
                </button>
              )}
              <input
                ref={(el) => {
                  fileInputRefs.current[itemIndex] = el;
                }}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleCoverChange(itemIndex, e)}
              />
            </div>

            <FormInput
              label="Story"
              placeholder="Write the full story here..."
              value={item.story || ""}
              onChangeText={(text) => updateItem(itemIndex, "story", text)}
              multiline
            />

            <div className={formStyles.section}>
              <label className={formStyles.sectionLabel}>Questions & Answers</label>

              {questions.map((qa, qIndex) => (
                <div key={qIndex} className={styles.qaCard}>
                  <div style={{ flex: 1 }}>
                    <p className={styles.qaQuestion}>Q: {qa.question}</p>
                    <div className={styles.optionsList}>
                      {(qa.options || []).map((opt, oIndex) => (
                        <span
                          key={oIndex}
                          className={`${styles.optionBadge} ${
                            opt.isCorrect ? styles.optionBadgeCorrect : styles.optionBadgeWrong
                          }`}
                        >
                          {opt.isCorrect ? "✓" : "○"} {opt.text}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    className={styles.removeQAButton}
                    onClick={() => removeQA(itemIndex, qIndex)}
                  >
                    🗑️
                  </button>
                </div>
              ))}

              <div className={styles.newQAContainer}>
                <FormInput
                  label="Question"
                  placeholder="e.g. Where does the dog live?"
                  value={getNewQuestion(itemIndex)}
                  onChangeText={(text) => setNewQuestion(itemIndex, text)}
                />

                <label className={styles.optionsLabel}>Answer Options</label>
                <p className={styles.optionsHint}>
                  Click the circle to mark the correct answer
                </p>

                {getNewOptions(itemIndex).map((opt, i) => (
                  <div key={i} className={styles.optionRow}>
                    <button
                      className={`${styles.radioButton} ${
                        opt.isCorrect ? styles.radioButtonActive : ""
                      }`}
                      onClick={() => handleSetCorrect(itemIndex, i)}
                    >
                      {opt.isCorrect && <div className={styles.radioInner} />}
                    </button>
                    <div className={styles.optionInputWrapper}>
                      <FormInput
                        placeholder={`Option ${i + 1}${opt.isCorrect ? " (correct)" : ""}`}
                        value={opt.text}
                        onChangeText={(text) => handleOptionText(itemIndex, i, text)}
                      />
                    </div>
                    {getNewOptions(itemIndex).length > 2 && (
                      <button
                        className={styles.removeOptionBtn}
                        onClick={() => removeOption(itemIndex, i)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                <button className={styles.addOptionButton} onClick={() => addOption(itemIndex)}>
                  + Add another option
                </button>

                <button
                  className={styles.addQABtn}
                  onClick={() => addQA(itemIndex)}
                  disabled={!canAdd(itemIndex)}
                >
                  + Add Question
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <button className={formStyles.addButton} onClick={addItem}>
        + Add item
      </button>
    </div>
  );
}
