import styles from "./UnitCard.module.css";

type Props = {
  order?: number;
  name: string;
  difficulty: string;
  onPress?: () => void;
};

const DIFFICULTY_CONFIG: Record<string, { level: number; activeClass: string }> = {
  low: { level: 1, activeClass: "lowActive" },
  medium: { level: 2, activeClass: "mediumActive" },
  hard: { level: 3, activeClass: "hardActive" },
};

export default function UnitCard({ order, name, difficulty, onPress }: Props) {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.low;

  return (
    <div className={styles.card}>
      <div className={styles.container}>
        <button className={styles.mainContent} onClick={onPress}>
          <div className={styles.iconContainer}>📘</div>
          <div className={styles.infoContainer}>
            <p className={styles.title}>Unidad {order}</p>
            <p className={styles.description}>{name}</p>
            <div className={styles.segmentsContainer}>
              {[1, 2, 3].map((segmentIndex) => {
                const isActive = config.level >= segmentIndex;
                const activeClass = isActive
                  ? styles[config.activeClass as keyof typeof styles]
                  : "";
                return (
                  <div
                    key={segmentIndex}
                    className={`${styles.segment} ${activeClass}`}
                  />
                );
              })}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
