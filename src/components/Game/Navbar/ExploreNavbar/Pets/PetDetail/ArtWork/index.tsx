import {
  petImagePath,
  petFallbackImagePath,
  petStarStyle,
} from "@/utils/character/petVisuals";
import styles from "./styles.module.css";
import type { PetEntry } from "@/hooks/menu/pets/usePetsMenu";
import { PET_STAR_MAX } from "@/data/characters/pets/petProgress";

interface PetArtworkProps {
    entry: PetEntry;
    petNpc: string;
    name: string;
    message: string | null;
    selectedStar: number;
    fusing: boolean;
    eligible: number;
    isEquipped: boolean;
    canFuse: () => boolean;
    startFuse: (star: number) => void;
    executeFuse: () => void;
    equipPet: () => void;
    unequipPet: () => void;
}

export function PetArtwork({
  entry,
  petNpc,
  name,
  message,
  selectedStar,
  fusing,
  eligible,
  isEquipped,
  canFuse,
  startFuse,
  executeFuse,
  equipPet,
  unequipPet,
}: PetArtworkProps) {
  function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;

    if (img.dataset.fallbackUsed) {
      img.src = petFallbackImagePath("goat");
      return;
    }

    img.dataset.fallbackUsed = "1";
    img.src = img.dataset.fallback ?? petFallbackImagePath("goat");
  }

  return (
    <div className={styles.artPanel}>
      <div className={styles.artLabel}>
        <span>REGISTRO DA CRIATURA - {name.toUpperCase()}</span>

        {message && (
          <span className={styles.message} role="status">
            {message}
          </span>
        )}
      </div>
        <div className={styles.petArtwork}>
        <img
            src={petImagePath(petNpc, selectedStar)}
            alt={entry.name}
            className={styles.petImage}
            style={petStarStyle(selectedStar)}
            data-fallback={petFallbackImagePath(petNpc)}
            onError={handleImageError}
        />

        {!fusing ? (
            canFuse() && (
                <button
                    type="button"
                    disabled={!entry.owned}
                    className={`${styles.actionBtn} ${styles.fuseBtn}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        startFuse(eligible);
                    }}
                >
                FUNDIR · 2× ★{eligible}
            </button>
            )
        ) : (
            <button
                type="button"
                className={`${styles.actionBtn} ${styles.confirmFuseBtn}`}
                onClick={(e) => {
                    e.stopPropagation();
                    executeFuse();
                }}
            >
            CONFIRMAR FUSÃO?
            </button>
        )}

        {entry.owned && (
            <button
                type="button"
                disabled={!entry.owned}
                className={`${styles.equipButton} ${
                    isEquipped ? styles.unequipBtn : styles.equipBtn
                }`}
                onClick={(e) => {
                    e.stopPropagation();

                    if (isEquipped) {
                    unequipPet();
                    } else {
                    equipPet();
                    }
                }}
            >
            {isEquipped ? "DESEQUIPAR" : "EQUIPAR"}
            </button>
        )}
        </div>
        
        <div className={styles.artFooter}>
            <span>ESTÁGIO</span>

            <strong>
            {selectedStar} / {PET_STAR_MAX}
            </strong>
      </div>
    </div>
  );
}