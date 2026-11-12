import { useActivePotion } from "@/hooks/useActivePotion";
import styles from "./styles.module.css";
import { formatDuration } from "@/utils/formatDuration";

export function ActivePotionDisplay() {
  const activePotion = useActivePotion();
  if (!activePotion) return null;

  return (
    <div className={styles.potionSection}>
      <img
        loading="lazy"
        decoding="async"
        src={activePotion.image}
        alt={activePotion.name}
        className={styles.potionImage}
      />
      <span className={styles.potionName}>{activePotion.name}</span>
      <span className={styles.potionTimer}>
        {formatDuration(activePotion.remainingMs)}
      </span>
    </div>
  );
}
