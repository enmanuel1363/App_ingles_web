"use client";

import { useRef, useState } from "react";
import FormInput from "./FormInput";
import styles from "./UploadImageModal.module.css";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { url: string | File; description: string }) => void;
  title?: string;
  descriptionLabel?: string;
  descriptionPlaceholder?: string;
};

export default function UploadImageModal({
  visible,
  onClose,
  onSave,
  title = "Add image",
  descriptionLabel = "Description",
  descriptionPlaceholder = "Write a description...",
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [description, setDescription] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  if (!visible) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl("");
  };

  const handleSave = () => {
    if (!file) {
      alert("You must select an image.");
      return;
    }
    if (description.length < 2) {
      alert("The description is too short.");
      return;
    }
    onSave({ url: file, description });
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setPreviewUrl("");
    setDescription("");
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ✕
          </button>
        </div>

        {previewUrl ? (
          <div className={styles.previewContainer}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="preview" className={styles.imagePreview} />
            <button className={styles.removeButton} onClick={handleRemove}>
              ✕
            </button>
          </div>
        ) : (
          <button
            className={styles.uploadPlaceholder}
            onClick={() => inputRef.current?.click()}
          >
            <span style={{ fontSize: 32 }}>🖼️</span>
            <span className={styles.uploadText}>Select image</span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <FormInput
          label={descriptionLabel}
          placeholder={descriptionPlaceholder}
          value={description}
          onChangeText={setDescription}
        />

        <div className={styles.actions}>
          <button
            className={`${styles.actionButton} ${
              !file || description.length < 2 ? styles.disabledButton : styles.saveButton
            }`}
            onClick={handleSave}
            disabled={!file || description.length < 2}
          >
            + Add
          </button>
          <button className={`${styles.actionButton} ${styles.cancelButton}`} onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
