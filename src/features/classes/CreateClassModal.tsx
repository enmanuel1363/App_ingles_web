"use client";

import { useEffect, useState } from "react";
import modal from "@/components/ui/modal.module.css";
import { class_type } from "@/types/global.types";
import { useCreateClass, useUpdateClass } from "./useClasses";
import { ClassModel, CreateClassDTO } from "./class.types";

type Props = {
  visible: boolean;
  onClose: () => void;
  id_unit: string;
  nextOrderIndex: number;
  classToEdit?: ClassModel | null;
};

const CLASS_TYPE_OPTIONS: { label: string; value: class_type; icon: string }[] = [
  { label: "Mix", value: "mix", icon: "♾️" },
  { label: "Reading", value: "read", icon: "📖" },
  { label: "Writing", value: "write", icon: "✏️" },
  { label: "Speaking", value: "speak", icon: "🎙️" },
];

export default function CreateClassModal({
  visible,
  onClose,
  id_unit,
  nextOrderIndex,
  classToEdit,
}: Props) {
  const { mutateAsync: createClassMutation, isPending: isCreating } = useCreateClass();
  const { mutateAsync: updateClassMutation, isPending: isUpdating } = useUpdateClass();
  const isPending = isCreating || isUpdating;

  const [name, setName] = useState("");
  const [type, setType] = useState<class_type>("mix");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      if (classToEdit) {
        setName(classToEdit.name);
        setType(classToEdit.type);
      } else {
        setName("");
        setType("mix");
      }
      setError(null);
    }
  }, [visible, classToEdit]);

  if (!visible) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter a name for the class.");
      return;
    }

    try {
      if (classToEdit) {
        await updateClassMutation({ ...classToEdit, name: name.trim(), type });
      } else {
        const newClass: CreateClassDTO = {
          id_unit,
          name: name.trim(),
          type,
          order_index: nextOrderIndex,
        };
        await createClassMutation(newClass);
      }
      onClose();
    } catch {
      setError(
        classToEdit ? "Failed to update the class" : "Failed to create the class",
      );
    }
  };

  return (
    <div className={modal.overlay} onClick={onClose}>
      <div className={modal.modal} onClick={(e) => e.stopPropagation()}>
        <div className={modal.header}>
          <h2 className={modal.title}>
            {classToEdit ? "Edit Lesson" : "Create New Lesson"}
          </h2>
        </div>

        <div className={modal.field}>
          <label className={modal.label}>Lesson Name</label>
          <input
            className={modal.input}
            placeholder="E.g., Introduction to the Verb To Be"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className={modal.field}>
          <label className={modal.label}>Class Type</label>
          <select
            className={modal.select}
            value={type}
            onChange={(e) => setType(e.target.value as class_type)}
            disabled={isPending}
          >
            {CLASS_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.icon} {opt.label}
              </option>
            ))}
          </select>
        </div>

        {error && <p className={modal.errorText}>{error}</p>}

        <div className={modal.buttonsRow}>
          <button
            className={`${modal.button} ${modal.cancelButton}`}
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            className={`${modal.button} ${modal.createButton}`}
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending
              ? "Guardando…"
              : classToEdit
                ? "Save Changes"
                : "Create Class"}
          </button>
        </div>
      </div>
    </div>
  );
}
