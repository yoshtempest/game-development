import { useRef, useEffect } from "react";
import { Star } from "lucide-react";
import { elementBadgePath } from "@/utils/paths";
import { PET_STAR_MAX } from "@/data/characters/pets/petProgress";
import { PET_ROLE_LABELS } from "@/data/characters/pets/petSkills";
import { getNpcElementTypes } from "@/data/types/npcElementTypes";
import { usePetDetail } from "@/hooks/menu/pets/usePetDetail";
import type { PetEntry } from "@/hooks/menu/pets/usePetsMenu";
import { FusionOverlay } from "../FusionOverlay";
import { ProgressBar } from "@/components/Game/ProgressBar";
import {
  getPetXPToNextLevel,
  getPetClass,
} from "@/utils/character/petProgress";
import styles from "./styles.module.css";
import { PetDetailHeader } from "./Header";
import { PetArtwork } from "./ArtWork"
import { PetIdentity } from "./Identity";
import { PetAbilities } from "./Abilities";

type Props = {
  entry: PetEntry;
  onClose: () => void;
};

function formatDrop(entry: PetEntry): string {
  if (entry.dropChance === null) return "Baú";
  const pct = (entry.dropChance * 100).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  });
  return `${pct}%`;
}

export function PetDetail({ entry, onClose }: Props) {
  const {
    selectedStar,
    setSelectedStar,
    message,
    fusing,
    isEquipped,
    canFuse,
    highestEligibleStar,
    ownedQtyByStar,
    getPetStats,
    equipPet,
    unequipPet,
    startFuse,
    executeFuse,
    onClose: handleClose,
  } = usePetDetail({ entry, onClose });

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.children[selectedStar - 1] as
      | HTMLElement
      | undefined;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedStar]);

  const petNpc = entry.dropNpc ?? entry.id.replace("pet_", "");
  const eligible = highestEligibleStar();
  const stats = ownedQtyByStar(selectedStar) > 0
    ? getPetStats(selectedStar)
    : null;

  return (
    <>
      <div className={`containerOfNavbar ${styles.pokedex}`}>
        <PetDetailHeader name={entry.name} onClose={handleClose}/>
        <main className={styles.pokedexContent}>
          {/* Ficha principal */}
          <section className={styles.identitySection}>
            <PetArtwork 
              name={entry.name}
              message={message}
              petNpc={petNpc}
              entry={entry}
              selectedStar={selectedStar}
              eligible={eligible}
              isEquipped={isEquipped}
              fusing={!!fusing}
              canFuse={canFuse}
              startFuse={startFuse}
              executeFuse={executeFuse}
              equipPet={equipPet}
              unequipPet={unequipPet}
            />

            <div className={styles.identityInfo}>
              <PetIdentity entry={entry} />

              <div className={styles.attributeGrid}>
                <div className={styles.attributeCard}>
                  <span className={styles.attributeLabel}>FUNÇÃO</span>
                  <strong>{PET_ROLE_LABELS[entry.role]}</strong>
                </div>

                <div className={styles.attributeCard}>
                  <span className={styles.attributeLabel}>ELEMENTO</span>

                  <div className={styles.elementList}>
                    {getNpcElementTypes(petNpc).map((element) => (
                      <img
                        key={element}
                        src={elementBadgePath(
                          `${element.toLowerCase()}.svg`
                        )}
                        alt={element}
                        title={element}
                        className={styles.elementBadge}
                      />
                    ))}
                  </div>
                </div>

                <div className={styles.attributeCard}>
                  <span className={styles.attributeLabel}>CHANCE DE DROP</span>
                  <strong>{formatDrop(entry)}</strong>
                </div>
              </div>

              {entry.riddle && (
                <div className={styles.riddleCard}>
                  <span className={styles.attributeLabel}>
                    COMO ENCONTRAR
                  </span>
                  <p>{entry.riddle}</p>
                </div>
              )}
              <div className={styles.riddleCard}>
                <span className={styles.attributeLabel}>
                  LOCALIZAÇÃO
                </span>
                <p>
                  {entry.location ?? "Não descoberto"}
                </p>
              </div>
              
              <div className={styles.riddleCard}>
                {!entry.owned && (
                  <span className={styles.statusLocked}>
                    AINDA NÃO DESBLOQUEADO
                  </span>
                )}
                {stats && (
                  <div className={styles.xpSection}>
                    <div className={styles.xpHeader}>
                      <span>NÍVEL {stats.level}</span>
                      <span>
                        {stats.xp} /{" "}
                        {getPetXPToNextLevel(
                          stats.level,
                          getPetClass(entry.id)
                        )}{" "}
                        EXP
                      </span>
                    </div>

                    <ProgressBar
                      value={stats.xp}
                      max={getPetXPToNextLevel(
                        stats.level,
                        getPetClass(entry.id)
                      )}
                      animationId={`pet-detail-xp-${entry.id}`}
                      level={stats.level}
                    />
                  </div>
                )}
              </div>
              
            </div>
            
          </section>

          <PetAbilities entry={entry}/>

          {/* Seleção de estrelas */}
          <section className={styles.progressionSection}>
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.sectionEyebrow}>PROGRESSÃO</span>
                <h4>Estágios de evolução</h4>
              </div>

              <span className={styles.stageCount}>
                ★ {selectedStar}/{PET_STAR_MAX}
              </span>
            </div>

            <div className={styles.starList} ref={listRef}>
              {Array.from({ length: PET_STAR_MAX }, (_, i) => {
                const star = i + 1;
                const qty = ownedQtyByStar(star);
                const isSelected = selectedStar === star;
                const isOwned = qty > 0;

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
                      className={
                        isOwned ? styles.starFilled : styles.starEmpty
                      }
                    />

                    <span>Estágio {star}</span>

                    <strong>{isOwned ? `x${qty}` : "—"}</strong>
                  </button>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      {fusing && (
        <FusionOverlay
          entry={entry}
          stars={fusing.stars}
          onComplete={executeFuse}
        />
      )}
    </>
  );
}
