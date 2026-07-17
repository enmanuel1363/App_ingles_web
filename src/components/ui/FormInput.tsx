"use client";

import styles from "./FormInput.module.css";

type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
};

export default function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  multiline,
}: Props) {
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      {multiline ? (
        <textarea
          className={styles.input}
          placeholder={placeholder}
          value={value || ""}
          onChange={(e) => onChangeText(e.target.value)}
        />
      ) : (
        <input
          className={styles.input}
          placeholder={placeholder}
          value={value || ""}
          onChange={(e) => onChangeText(e.target.value)}
        />
      )}
    </div>
  );
}
