"use client";

import { useState } from "react";
import cardStyles from "./CreateUnitCard.module.css";
import CreateUnitModal from "./CreateUnitModal";

type Props = {
  courseId: string;
};

export default function CreateUnitCard({ courseId }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <button
        className={cardStyles.createButton}
        onClick={() => setVisible(true)}
      >
        <div className={cardStyles.iconContainer}>
          <span className={cardStyles.plus}>+</span>
        </div>
        <p className={cardStyles.title}>Create New Unit</p>
        <p className={cardStyles.subtitle}>
          Add lessons and assignments to your course
        </p>
      </button>

      <CreateUnitModal
        visible={visible}
        onClose={() => setVisible(false)}
        courseId={courseId}
      />
    </>
  );
}
