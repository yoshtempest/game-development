import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { elementBadgePath, rankBadgePath } from "@/utils/paths";
import { RANK_COLORS } from "@/data/equipment/definitions";
import { PET_STAR_MAX } from "@/data/characters/pets/petProgress";
import { getNpcElementTypes } from "@/data/types/npcElementTypes";
import { usePetsMenu } from "@/hooks/menu/pets/usePetsMenu";
import { useGameControls } from "@/contexts/GameControlsContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import { gridMove } from "@/gameRules/menu/navigation";
import {
  petImagePath,
  petFallbackImagePath,
  petStarStyle,
} from "@/utils/character/petVisuals";
import { PetDetail } from "./PetDetail";
import styles from "./styles.module.css";
import { RANKS } from "@/gameRules/rank";

export function Pets() {
  const listRef = useRef<HTMLDivElement | null>(null);
  const { pushControls } = useGameControls();
  const { playMove, playClose, playSelect } = useMenuSFX();

  const {
    pets,
    equippedId,
    selectedIndex,
    setSelectedIndex,
    newlyUnlockedPetIds,
    statsFor,
  } = usePetsMenu(true, listRef);

  const [openPet, setOpenPet] = useState<number | null>(null);
  const selectedIndexRef = useRef(selectedIndex);
  const petsRef = useLatestRef(pets);
  const playMoveRef = useLatestRef(playMove);
  const playCloseRef = useLatestRef(playClose);
  const playSelectRef = useLatestRef(playSelect);
  const pushControlsRef = useLatestRef(pushControls);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  useEffect(() => {
    if (openPet !== null) return;

    const remove = pushControlsRef.current({
      onUp: () => {
        playMoveRef.current();
        setSelectedIndex((prev) =>
          gridMove(prev, 4, "up", petsRef.current.length),
        );
        return true;
      },
      onDown: () => {
        playMoveRef.current();
        setSelectedIndex((prev) =>
          gridMove(prev, 4, "down", petsRef.current.length),
        );
        return true;
      },
      onLeft: () => {
        playMoveRef.current();
        setSelectedIndex((prev) =>
          gridMove(prev, 4, "left", petsRef.current.length),
        );
        return true;
      },
      onRight: () => {
        playMoveRef.current();
        setSelectedIndex((prev) =>
          gridMove(prev, 4, "right", petsRef.current.length),
        );
        return true;
      },
      onConfirm: () => {
        const entry = petsRef.current[selectedIndexRef.current];
        if (!entry) return true;
        setOpenPet(selectedIndexRef.current);
        playSelectRef.current();
        return true;
      },
      onCancel: () => {
        playCloseRef.current();
        return false;
      },
      blockGlobalOpen: true,
    });
    return remove;
  }, [
    pushControlsRef,
    playMoveRef,
    playCloseRef,
    playSelectRef,
    petsRef,
    selectedIndexRef,
    setSelectedIndex,
    openPet,
  ]);

  if (openPet !== null) {
    const entry = pets[openPet];
    if (!entry) {
      setOpenPet(null);
      return null;
    }
    return (
      <div className="containerOfNavbar">
        <PetDetail entry={entry} onClose={() => setOpenPet(null)} />
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className={`containerOfNavbar ${styles.petsContainer}`}
    >
      {pets.map((entry, index) => {
        const isSelected = index === selectedIndex;
        const isEquipped = equippedId === entry.id;
        const stats = statsFor(entry);

        const petNpc = entry.dropNpc ?? entry.id.replace("pet_", "");

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
                src={petImagePath(petNpc, stats?.stars ?? 1)}
                alt={entry.name}
                className={styles.petImage}
                style={entry.owned ? petStarStyle(stats?.stars ?? 1) : undefined}
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
              {entry.owned && newlyUnlockedPetIds.includes(entry.id) && (
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

                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

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

             <img
                className={styles.rankIcon}
                src={rankBadgePath(
                  RANKS.find((rank) => rank.id === entry.rank)?.src ?? "wandering.svg"
                )}
              />

              {isEquipped && (
                <span className={styles.equippedBadge}>Equipado</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
