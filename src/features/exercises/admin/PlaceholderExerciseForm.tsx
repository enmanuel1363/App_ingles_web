import styles from "./exercise-form.module.css";

type Props = {
  id_class: string;
  type: string;
  order_index: number;
};

export default function PlaceholderExerciseForm({ type }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.itemContainer}>
        <p style={{ margin: 0, color: "#6b7280" }}>
          El formulario para <strong>{type}</strong> se implementa en una
          siguiente sub-fase.
        </p>
      </div>
    </div>
  );
}
