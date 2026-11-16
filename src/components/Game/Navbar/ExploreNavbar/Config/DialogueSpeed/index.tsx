import { ChevronLeft, ChevronRight, MessageCircleMore } from "lucide-react";
import styles from "@/components/Game/Navbar/ExploreNavbar/Config/styles.module.css";
import { SPEED_LABEL } from "@/utils/settings";
import type { DialogueSpeed } from "@/utils/settings";

type Props = {
  selectedIndex: number;
  selectedColumn: number;
  activeSpeed: DialogueSpeed;
  onPrev: () => void;
  onNext: () => void;
};

export function DialogueSpeedSection({
  selectedIndex,
  selectedColumn,
  activeSpeed,
  onPrev,
  onNext,
}: Props) {
  const isSelected = selectedColumn === 1 && selectedIndex === 0;

  return (
    <div className={styles.compactContainer}>
      <div className="navbarContainerRow">
        <MessageCircleMore />
        <h2>Diálogo</h2>
      </div>

      <div className={styles.compactSelector}>
        {isSelected && <span className={styles.cursor}>▼</span>}

        <button
          type="button"
          className={`${styles.triangle} ${styles.triangleBlink}`}
          onClick={onPrev}
          aria-label="Velocidade de diálogo anterior"
        >
          <ChevronLeft size={28} />
        </button>

        <div
          className={`${styles.item} ${styles.active} ${isSelected ? styles.selected : ""}`}
        >
          <h2>{SPEED_LABEL[activeSpeed].toUpperCase()}</h2>
        </div>

        <button
          type="button"
          className={`${styles.triangle} ${styles.triangleBlink}`}
          onClick={onNext}
          aria-label="Próxima velocidade de diálogo"
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );
}
