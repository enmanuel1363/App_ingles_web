"use client";

import FormInput from "@/components/ui/FormInput";
import UploadImageModal from "@/components/ui/UploadImageModal";
import { useState } from "react";
import { useExerciseStore } from "../useExerciseStore";
import formStyles from "./exercise-form.module.css";
import styles from "./gallery-form.module.css";

const EMPTY_ITEM = { images: [] as { url: string | File; description: string }[] };

type Props = {
  id_class: string;
  type: "match_names";
  order_index: number;
};

export default function MatchNamesExerciseForm({ order_index }: Props) {
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

  const addItem = () => updateContent("items", [...items, { images: [] }]);

  const removeItem = (itemIndex: number) => {
    if (items.length <= 1) return;
    updateContent(
      "items",
      items.filter((_: any, i: number) => i !== itemIndex),
    );
  };

  const addImageToItem = (
    itemIndex: number,
    imageData: { url: string | File; description: string },
  ) => {
    const currentImages = items[itemIndex].images || [];
    if (currentImages.length < 4) {
      updateItem(itemIndex, "images", [...currentImages, imageData]);
    }
  };

  const removeImageFromItem = (itemIndex: number, imgIndex: number) => {
    updateItem(
      itemIndex,
      "images",
      items[itemIndex].images.filter((_: any, i: number) => i !== imgIndex),
    );
  };

  const previewSrc = (url: string | File) =>
    typeof url === "string" ? url : URL.createObjectURL(url);

  return (
    <div className={formStyles.container}>
      <FormInput
        label="Exercise Title"
        placeholder="e.g. Coastal Wildlife Gallery"
        value={exercise.name}
        onChangeText={(text) => updateField("name", text)}
      />
      <FormInput
        label="Descriptive Text"
        placeholder="e.g. Match each image with its correct name"
        value={exercise.description}
        onChangeText={(text) => updateField("description", text)}
        multiline
      />

      {items.map((item: any, itemIndex: number) => {
        const count = (item.images || []).length;
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

            <div className={formStyles.section}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span className={formStyles.sectionLabel}>Gallery ({count}/4)</span>
                {count < 4 && (
                  <button
                    className={styles.uploadButtonSmall}
                    onClick={() => {
                      setUploadingItemIndex(itemIndex);
                      setShowUploadModal(true);
                    }}
                  >
                    + Add Image
                  </button>
                )}
              </div>

              {count > 0 ? (
                <div className={styles.galleryGrid}>
                  {item.images.map((img: any, imgIndex: number) => (
                    <div key={imgIndex} className={styles.imageCard}>
                      <div className={styles.previewContainerSmall}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewSrc(img.url)}
                          alt={img.description}
                          className={styles.imagePreview}
                        />
                        <button
                          className={styles.removeButton}
                          onClick={() => removeImageFromItem(itemIndex, imgIndex)}
                        >
                          ✕
                        </button>
                      </div>
                      <p className={styles.imageDescriptionText}>{img.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyImages}>
                  <span style={{ fontSize: 28 }}>🔗</span>
                  <span className={styles.emptyImagesText}>No images added yet</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <button className={formStyles.addButton} onClick={addItem}>
        + Add item
      </button>

      <UploadImageModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSave={(imgData) => {
          if (uploadingItemIndex !== null) addImageToItem(uploadingItemIndex, imgData);
        }}
        title="Add to Gallery"
        descriptionLabel="Name / description"
        descriptionPlaceholder="e.g. Dolphin"
      />
    </div>
  );
}
