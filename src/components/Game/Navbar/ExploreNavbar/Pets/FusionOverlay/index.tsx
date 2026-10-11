import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import styles from "./styles.module.css";
import type { PetEntry } from "@/hooks/menu/pets/usePetsMenu";
import {
  petNpcType,
  petImagePath,
  petFallbackImagePath,
  petStarStyle,
  getPetStarVisual,
} from "@/utils/character/petVisuals";
import { PET_STAR_MAX } from "@/data/characters/pets/petProgress";

const MERGE_MS = 1100;
const RESULT_MS = 1500;

type Props = {
  entry: PetEntry;
  stars: number;
  onComplete: () => void;
};

function PetImg({
  petNpc,
  stars,
  className,
  scale = 1,
}: {
  petNpc: string;
  stars: number;
  className?: string;
  scale?: number;
}) {
  return (
    <img
      src={petImagePath(petNpc, stars)}
      alt="pet"
      className={className}
      style={{
        ...petStarStyle(stars),
        transform: `${petStarStyle(stars).transform} scale(${scale})`,
      }}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = petFallbackImagePath(petNpc);
      }}
    />
  );
}

function StarLabel({ stars, color }: { stars: number; color: string }) {
  return (
    <div className={styles.starLabel}>
      {Array.from({ length: PET_STAR_MAX }, (_, i) => (
        <Star
          key={i}
          size={14}
          style={{ color: i < stars ? color : "rgba(255,255,255,0.15)" }}
          fill={i < stars ? color : "transparent"}
        />
      ))}
    </div>
  );
}

export function FusionOverlay({ entry, stars, onComplete }: Props) {
  const [phase, setPhase] = useState<"merge" | "result">("merge");
  const petNpc = petNpcType(entry);
  const completedRef = useRef(false);

  useEffect(() => {
    const mergeTimer = setTimeout(() => setPhase("result"), MERGE_MS);
    const completeTimer = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }, MERGE_MS + RESULT_MS);
    return () => {
      clearTimeout(mergeTimer);
      clearTimeout(completeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resultVisual = getPetStarVisual(stars + 1);

  return (
    <div className={styles.overlay}>
      <div className={styles.stage}>
        <h3 className={styles.title}>Fusão de Pets</h3>

        {phase === "merge" ? (
          <div className={styles.mergeArea}>
            <div className={`${styles.sourcePet} ${styles.sourceLeft}`}>
              <PetImg petNpc={petNpc} stars={stars} className={styles.image} />
              <StarLabel
                stars={stars}
                color={getPetStarVisual(stars).auraColor}
              />
              <span className={styles.sourceLabel}>★ {stars}</span>
            </div>
            <div className={`${styles.sourcePet} ${styles.sourceRight}`}>
              <PetImg petNpc={petNpc} stars={stars} className={styles.image} />
              <StarLabel
                stars={stars}
                color={getPetStarVisual(stars).auraColor}
              />
              <span className={styles.sourceLabel}>★ {stars}</span>
            </div>
          </div>
        ) : (
          <div className={styles.resultArea}>
            <div className={styles.resultBurst} />
            <PetImg
              petNpc={petNpc}
              stars={stars + 1}
              className={styles.image}
              scale={1.15}
            />
            <StarLabel stars={stars + 1} color={resultVisual.auraColor} />
            <h4 className={styles.resultLabel}>Nova versão {stars + 1}★</h4>
          </div>
        )}
      </div>
    </div>
  );
}
