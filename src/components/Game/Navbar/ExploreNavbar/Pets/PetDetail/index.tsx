import { useRef, useEffect } from "react";
import { Star } from "lucide-react";
import { elementBadgePath } from "@/utils/paths";
import { RANK_COLORS, RANK_LABELS } from "@/data/equipment/definitions";
import { RANKS } from "@/gameRules/rank";
import { rankBadgePath } from "@/utils/paths";
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
import {
  petImagePath,
  petFallbackImagePath,
  petStarStyle,
} from "@/utils/character/petVisuals";

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
    equippedStar,
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
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <span className={styles.headerLabel}>DELÍCIADEX</span>
            <h3>{entry.name}</h3>
          </div>

          <button
            className={styles.backBtn}
            onClick={handleClose}
            type="button"
          >
            ← VOLTAR
          </button>
        </header>

        <main className={styles.pokedexContent}>
          {/* Ficha principal */}
          <section className={styles.identitySection}>
            <div className={styles.artPanel}>
              <span className={styles.artLabel}>REGISTRO DA CRIATURA - {entry.name.toUpperCase()}</span>

              <div className={styles.petArtwork}>
                <img
                  src={petImagePath(petNpc, selectedStar)}
                  alt={entry.name}
                  className={styles.petImage}
                  style={petStarStyle(selectedStar)}
                  data-fallback={petFallbackImagePath(petNpc)}
                  onError={(e) => {
                    const img = e.currentTarget;

                    if (img.dataset.fallbackUsed) {
                      img.src = petFallbackImagePath("goat");
                    } else {
                      img.dataset.fallbackUsed = "1";
                      img.src =
                        img.dataset.fallback ??
                        petFallbackImagePath("goat");
                    }
                  }}
                />
              </div>

              <div className={styles.artFooter}>
                <span>ESTÁGIO</span>
                <strong>
                  {selectedStar} / {PET_STAR_MAX}
                </strong>
              </div>
            </div>

            <div className={styles.identityInfo}>
              <div className={styles.nameBlock}>
                <span className={styles.sectionEyebrow}>
                  FICHA DA CRIATURA
                </span>

                <h2
                  className={styles.petName}
                  style={{ color: RANK_COLORS[entry.rank] }}
                >
                  {entry.name}
                </h2>

                <div className={styles.rankRow}>
                  <img
                    className={styles.rankIcon}
                    src={rankBadgePath(
                      RANKS.find((rank) => rank.id === entry.rank)?.src ??
                        "wandering.svg"
                    )}
                    alt={`Rank ${RANK_LABELS[entry.rank]}`}
                  />

                  <span
                    className={styles.rankName}
                    style={{ color: RANK_COLORS[entry.rank] }}
                  >
                    {RANK_LABELS[entry.rank]}
                  </span>
                </div>
              </div>

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
                <p>{entry.location}</p>
              </div>
            </div>
          </section>

          {/* Habilidades */}
          <section className={styles.abilitiesSection}>
            <div className={styles.abilityCard}>
              <span className={styles.sectionEyebrow}>HABILIDADE PASSIVA</span>
              <h4>{entry.passiveName}</h4>
            </div>

            <div className={styles.abilityCard}>
              <span className={styles.sectionEyebrow}>HABILIDADE ATIVA</span>
              <h4>{entry.skillName}</h4>
            </div>
          </section>

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

            <div className={styles.equipmentStatus}>
              <span
                className={
                  isEquipped
                    ? styles.statusEquipped
                    : styles.statusNotEquipped
                }
              >
                {isEquipped
                  ? `EQUIPADO · ★${equippedStar}`
                  : "NÃO EQUIPADO"}
              </span>
            </div>

            {message && (
              <div className={styles.message} role="status">
                {message}
              </div>
            )}

            <div className={styles.actionRow}>
              {!fusing ? (
                <>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${
                      isEquipped ? styles.unequipBtn : styles.equipBtn
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();

                      if (isEquipped) unequipPet();
                      else equipPet();
                    }}
                  >
                    {isEquipped ? "DESEQUIPAR" : "EQUIPAR"}
                  </button>

                  {canFuse() && (
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.fuseBtn}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        startFuse(eligible);
                      }}
                    >
                      FUNDIR · 2× ★{eligible}
                    </button>
                  )}
                </>
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
