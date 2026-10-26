import { ProgressBar } from "@/components/Game/ProgressBar";
import {
  getPetXPToNextLevel,
  getPetClass,
} from "@/utils/character/petProgress";
import type { PetEntry } from "@/hooks/menu/pets/usePetsMenu";
import styles from "./styles.module.css";

export type PetStats = {
  level: number;
  xp: number;
}

interface PetExperienceProps {
  entry: PetEntry;
  stats: PetStats;
}

export function PetExperience({
  entry,
  stats,
}: PetExperienceProps) {
  const maxXp = getPetXPToNextLevel(
    stats.level,
    getPetClass(entry.id),
  );

  return (
    <div className={styles.xpSection}>
      <div className={styles.xpHeader}>
        <span>NÍVEL {stats.level}</span>

        <span>
          {stats.xp} / {maxXp} EXP
        </span>
      </div>

      <ProgressBar
        value={stats.xp}
        max={maxXp}
        animationId={`pet-detail-xp-${entry.id}`}
        level={stats.level}
      />
    </div>
  );
}