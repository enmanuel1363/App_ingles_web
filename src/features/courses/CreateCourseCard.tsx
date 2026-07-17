"use client";

import { useState } from "react";
import styles from "./CreateCourseCard.module.css";
import CreateCourseModal from "./CreateCourseModal";

export default function CreateCourseCard() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <button className={styles.createButton} onClick={() => setVisible(true)}>
        <div className={styles.iconContainer}>
          <span className={styles.plus}>+</span>
        </div>
        <p className={styles.title}>Create new class</p>
        <p className={styles.subtitle}>
          Set up a new workspace for your students
        </p>
      </button>

      <CreateCourseModal visible={visible} onClose={() => setVisible(false)} />
    </>
  );
}
