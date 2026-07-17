import styles from "./GradeIcon.module.css";

type Props = {
  grade: string;
};

const CONFIG: Record<string, { color: string; bg: string }> = {
  "7mo": { color: "#24DFE2", bg: "rgba(36, 223, 226, 0.12)" },
  "8vo": { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.12)" },
  "9no": { color: "#22C55E", bg: "rgba(34, 197, 94, 0.12)" },
  "10mo": { color: "#4480EF", bg: "rgba(68, 128, 239, 0.12)" },
  "11mo": { color: "#EF4444", bg: "rgba(239, 68, 68, 0.12)" },
};

const DEFAULT = { color: "#24DFE2", bg: "rgba(36, 223, 226, 0.12)" };

export default function GradeIcon({ grade }: Props) {
  const { color, bg } = CONFIG[grade] || DEFAULT;

  return (
    <div className={styles.badge} style={{ backgroundColor: bg, color }}>
      {grade}
    </div>
  );
}
