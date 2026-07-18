"use client";

import FormInput from "@/components/ui/FormInput";
import UploadImageModal from "@/components/ui/UploadImageModal";
import { useState } from "react";
import { useExerciseStore } from "../useExerciseStore";
import formStyles from "./exercise-form.module.css";
import imgStyles from "./image-item-form.module.css";

const EMPTY_ITEM = { image_url: "" as string | File, image_title: "" };

type Props = {
  id_class: string;
  type: "write_word";
  order_index: number;
};

export default function WriteWordExerciseForm({ order_index }: Props) {
  const { data, updateExercise } = useExerciseStore();
  const exercise = data[order_index] || {
    name: "",
    description: "",
    content: { items: [{ ...EMPTY_ITEM }] },
  };

  const items = exercise.content?.items || [EMPTY_ITEM];
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingItemIndex, setUploadingItemIndex] = useState<number | null>(null);

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

  const handleSaveImage = (imageData: { url: string | File; description: string }) => {
    if (uploadingItemIndex === null) return;
    updateItem(uploadingItemIndex, "image_url", imageData.url);
    updateItem(uploadingItemIndex, "image_title", imageData.description);
  };

  const previewSrc = (url: string | File) =>
    typeof url === "string" ? url : URL.createObjectURL(url);

  return (
    <div className={formStyles.container}>
      <FormInput
        label="Title of the exercise"
        placeholder="e.g. What is this?"
        value={exercise.name}
        onChangeText={(text) => updateField("name", text)}
      />
      <FormInput
        label="Description"
        placeholder="Observe the image and write the correct word"
        value={exercise.description}
        onChangeText={(text) => updateField("description", text)}
        multiline
      />

      {items.map((item: any, itemIndex: number) => (
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

          <div className={imgStyles.headerSection}>
            <span className={formStyles.sectionLabel}>Image of the Exercise</span>
            <button
              className={imgStyles.uploadButton}
              onClick={() => {
                setUploadingItemIndex(itemIndex);
                setShowUploadModal(true);
              }}
            >
              📷 {item.image_url ? "Change" : "Add"}
            </button>
          </div>

          {item.image_url ? (
            <div className={imgStyles.imageContainer}>
              <div className={imgStyles.previewContainer}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewSrc(item.image_url)}
                  alt={item.image_title}
                  className={imgStyles.imagePreview}
                />
                <button
                  className={imgStyles.removeButton}
                  onClick={() => {
                    updateItem(itemIndex, "image_url", "");
                    updateItem(itemIndex, "image_title", "");
                  }}
                >
                  ✕
                </button>
              </div>
              <div className={imgStyles.imageInfo}>
                <span className={imgStyles.imageInfoText}>{item.image_title}</span>
              </div>
            </div>
          ) : (
            <button
              className={imgStyles.emptyPlaceholder}
              onClick={() => {
                setUploadingItemIndex(itemIndex);
                setShowUploadModal(true);
              }}
            >
              <span style={{ fontSize: 28 }}>🖼️</span>
              <span className={imgStyles.emptyText}>No image selected</span>
            </button>
          )}
        </div>
      ))}

      <button className={formStyles.addButton} onClick={addItem}>
        + Add item
      </button>

      <UploadImageModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSave={handleSaveImage}
        title="Exercise Image"
        descriptionLabel="Word to write"
        descriptionPlaceholder="e.g. Apple"
      />
    </div>
  );
}
