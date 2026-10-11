import { useRef } from "react";
import { Star } from "lucide-react";
import { elementBadgePath } from "@/utils/paths";
import { RANK_COLORS, RANK_LABELS } from "@/data/equipment/definitions";
import { PET_STAR_MAX } from "@/data/characters/pets/petProgress";
import { PET_ROLE_LABELS } from "@/data/characters/pets/petSkills";
import { getNpcElementTypes } from "@/data/types/npcElementTypes";
import { usePetsMenu } from "@/hooks/menu/pets/usePetsMenu";
import type { PetEntry } from "@/hooks/menu/pets/usePetsMenu";
import styles from "./styles.module.css";
import { FusionOverlay } from "./FusionOverlay";
import { ProgressBar } from "@/components/Game/ProgressBar";
import {
  getPetXPToNextLevel,
  getPetClass,
} from "@/utils/character/petProgress";
import {
  petImagePath,
  petFallbackImagePath,
  petStarStyle,
} from "@/utils/character/petVisuals";

function formatDrop(entry: PetEntry): string {
  if (entry.dropChance === null) return "Baú";
  const pct = (entry.dropChance * 100).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  });
  return `${pct}%`;
}

export function Pets() {
  const listRef = useRef<HTMLDivElement | null>(null);
  const {
    pets,
    equippedId,
    selectedIndex,
    pendingStar,
    highestEligibleStar,
    statsFor,
    fusing,
    finishFusion,
    newlyUnlockedPetIds,
  } = usePetsMenu(true, listRef);

  const fusingEntry = fusing
    ? (pets.find((p) => p.id === fusing.petId) ?? null)
    : null;

  return (
    <>
      <div
        ref={listRef}
        className={`containerOfNavbar ${styles.petsContainer}`}
      >
        {pets.map((entry, index) => {
          const isSelected = index === selectedIndex;
          const isEquipped = equippedId === entry.id;
          const stats = statsFor(entry);
          const eligible = highestEligibleStar(entry);
          const canFuse = eligible > 0;
          const isFusing = isSelected && pendingStar !== 0;
          const petNpc = entry.dropNpc ?? entry.id.replace("pet_", "");
          const imageStars = stats?.stars ?? 1;
          const isNewUnlocked =
            entry.owned && newlyUnlockedPetIds.includes(entry.id);

          return (
            <div
              key={entry.id}
              className={`${styles.pet} ${!entry.owned ? styles.petLocked : ""} ${
                isEquipped ? styles.equipped : ""
              } ${isSelected ? styles.selected : ""}`}
            >
              {isSelected && (
                <span className={`cursor ${styles.cursor}`}>▼</span>
              )}

              <div className={styles.imageBox}>
                <img
                  src={petImagePath(petNpc, imageStars)}
                  alt={entry.name}
                  className={styles.petImage}
                  style={entry.owned ? petStarStyle(imageStars) : undefined}
                  data-fallback={petFallbackImagePath(petNpc)}
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.dataset.fallbackUsed) {
                      img.src = petFallbackImagePath("goat");
                    } else {
                      img.dataset.fallbackUsed = "1";
                      img.src =
                        img.dataset.fallback || petFallbackImagePath("goat");
                    }
                  }}
                />
                {isNewUnlocked && (
                  <span className={styles.unlockBadge}>Novo!</span>
                )}
                {entry.owned && stats && (
                  <>
                    <div className={styles.starsRow}>
                      {Array.from({ length: PET_STAR_MAX }, (_, i) => {
                        const star = i + 1;
                        const qty = entry.qtyByStar[i] ?? 0;
                        return (
                          <div key={star} className={styles.starChip}>
                            <Star
                              size={12}
                              className={
                                qty > 0 ? styles.starFilled : styles.starEmpty
                              }
                            />
                            {qty > 0 && (
                              <span className={styles.starQty}>x{qty}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {isSelected && canFuse && (
                  <span
                    className={`${styles.fuseBadge} ${
                      isFusing ? styles.fuseConfirm : ""
                    }`}
                  >
                    {isFusing ? "CONFIRMAR FUSÃO?" : `FUNDIR (2x ★${eligible})`}
                  </span>
                )}
              </div>

              <div className={styles.flexColumn}>
                <div className={styles.flexRow}>
                  <h2
                    className={styles.name}
                    style={{ color: RANK_COLORS[entry.rank] }}
                  >
                    {entry.name}
                  </h2>
                  {entry.owned && stats && (
                    <>
                      <p className={styles.statsLine}>Nv.{stats.level}</p>
                    </>
                  )}
                  {getNpcElementTypes(petNpc).map((element) => (
                    <img
                      key={element}
                      src={elementBadgePath(`${element.toLowerCase()}.svg`)}
                      alt={element}
                      title={element}
                      className={styles.elementBadge}
                    />
                  ))}
                </div>
                {entry.owned && stats && (
                  <>
                    <div className={styles.flexRow}>
                      <ProgressBar
                        value={stats.xp}
                        max={getPetXPToNextLevel(
                          stats.level,
                          getPetClass(entry.id),
                        )}
                        animationId={`pet-xp-${entry.id}`}
                        level={stats.level}
                      />
                      <p className={styles.statsLine}>
                        {stats.xp} /{" "}
                        {getPetXPToNextLevel(
                          stats.level,
                          getPetClass(entry.id),
                        )}
                      </p>
                    </div>
                  </>
                )}

                {isEquipped && (
                  <span className={styles.equippedBadge}>Equipado</span>
                )}

                <span className={styles.roleBadge}>
                  {PET_ROLE_LABELS[entry.role]}
                </span>

                <div className={styles.flexRow}>
                  <p
                    className={styles.rankLabel}
                    style={{ color: RANK_COLORS[entry.rank] }}
                  >
                    {RANK_LABELS[entry.rank]}
                  </p>
                  <p className={styles.dropLine}>Drop: {formatDrop(entry)}</p>
                </div>

                <p className={styles.skillLine}>Passiva: {entry.passiveName}</p>
                <p className={styles.skillLine}>Skill: {entry.skillName}</p>
              </div>
            </div>
          );
        })}
      </div>

      {fusing && fusingEntry && (
        <FusionOverlay
          entry={fusingEntry}
          stars={fusing.stars}
          onComplete={finishFusion}
        />
      )}
    </>
  );
}
