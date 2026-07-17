import { class_type } from "@/types/global.types";
import styles from "./ClassCard.module.css";

type Props = {
  id?: string;
  name: string;
  type: class_type;
  order_index: number;
  created_at?: string;
  updated_at?: string;
  onPress: (id: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

const ICONS: Record<class_type, string> = {
  mix: "♾️",
  read: "📖",
  write: "✏️",
  speak: "🎙️",
};

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ClassCard({
  id,
  name,
  order_index,
  type,
  created_at,
  onPress,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.main}>
        <button className={styles.leftContent} onClick={() => onPress(id || "")}>
          <div className={styles.iconView}>{ICONS[type]}</div>
          <div>
            <p className={styles.title}>{`${order_index} - ${name}`}</p>
            <div className={styles.dateContainer}>
              <span>Created at:</span>
              <span className={styles.highlightText}>
                {formatDate(created_at || "")}
              </span>
            </div>
          </div>
        </button>

        <div className={styles.rightContent}>
          <button className={styles.actionButton} onClick={onEdit}>
            ✏️
          </button>
          <button className={styles.actionButton} onClick={onDelete}>
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
