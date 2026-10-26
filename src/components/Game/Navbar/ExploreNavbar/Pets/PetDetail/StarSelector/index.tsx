import { Star } from "lucide-react";
import { PET_STAR_MAX } from "@/data/characters/pets/petProgress";
import styles from "./styles.module.css";
import shared from "@/components/Game/Navbar/ExploreNavbar/Pets/PetDetail/styles.module.css";

interface PetStarSelectorProps {
  selectedStar: number;
  setSelectedStar: (star: number) => void;
  ownedQtyByStar: (star: number) => number;
}

export function PetStarSelector({
  selectedStar,
  setSelectedStar,
  ownedQtyByStar,
}: PetStarSelectorProps) {
  return (
    <section className={styles.progressionSection}>
      <div className={styles.sectionHeading}>
        <div>
          <span className={shared.sectionEyebrow}>PROGRESSÃO</span>
          <h4>Estágios de evolução</h4>
        </div>

        <span className={styles.stageCount}>
          ★ {selectedStar}/{PET_STAR_MAX}
        </span>
      </div>

      <div className={styles.starList}>
        {Array.from({ length: PET_STAR_MAX }, (_, index) => {
          const star = index + 1;
          const quantity = ownedQtyByStar(star);
          const isSelected = selectedStar === star;
          const isOwned = quantity > 0;

          return (
            <button
              key={star}
              type="button"
              className={`${styles.starItem} ${
                isSelected ? styles.starSelected : ""
              } ${!isOwned ? styles.starLocked : ""}`}
              disabled={!isOwned}
              aria-pressed={isSelected}
              onClick={() => setSelectedStar(star)}
            >
              <Star
                size={18}
                className={isOwned ? styles.starFilled : styles.starEmpty}
              />

              <span>Estágio {star}</span>

              <strong>{isOwned ? `x${quantity}` : "—"}</strong>
            </button>
          );
        })}
      </div>
    </section>
  );
}
