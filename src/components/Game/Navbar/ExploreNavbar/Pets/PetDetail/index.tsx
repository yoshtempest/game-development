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
      <div className="containerOfNavbar">
        <h3 className={styles.header}>
          <span>{entry.name}</span>
          <button className={styles.backBtn} onClick={handleClose}>
            ← Voltar
          </button>
        </h3>

        <div className={styles.panels}>
          <div className={styles.leftPanel}>
            <h4 className={styles.starSectionTitle}>Estrelas</h4>
            <div className={styles.starList} ref={listRef}>
              {Array.from({ length: PET_STAR_MAX }, (_, i) => {
                const star = i + 1;
                const qty = ownedQtyByStar(star);
                const isSelected = selectedStar === star;
                const isOwned = qty > 0;
                return (
                  <div
                    key={star}
                    className={`${styles.starItem} ${
                      isSelected ? styles.starSelected : ""
                    } ${!isOwned ? styles.starLocked : ""}`}
                    onClick={() => {
                      if (isOwned) setSelectedStar(star);
                    }}
                  >
                    <div className={styles.starHeader}>
                      <span className={styles.starLabel}>★{star}</span>
                      {isOwned && <span className={styles.starQty}>x{qty}</span>}
                    </div>
                    <div className={styles.starBody}>
                      {isOwned ? (
                        <>
                          <Star
                            size={14}
                            style={{ color: "var(--accent-color)" }}
                          />
                          <span className={styles.starOwned}>Disponível</span>
                        </>
                      ) : (
                        <span className={styles.starLockedText}>Bloqueado</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.rightPanel}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Rank:</span>
              <span
                className={styles.infoValue}
                style={{ color: RANK_COLORS[entry.rank] }}
              >
                {RANK_LABELS[entry.rank]}
              </span>
              <img
                className={styles.rankIcon}
                src={rankBadgePath(
                  RANKS.find((rank) => rank.id === entry.rank)?.src ?? "wandering.svg"
                )}
              />
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Função:</span>
              <span className={styles.infoValue}>
                {PET_ROLE_LABELS[entry.role]}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Elemento:</span>
              
              {getNpcElementTypes(petNpc).map((element) => (
                <img
                  src={elementBadgePath(`${element.toLowerCase()}.svg`)}
                  alt={element}
                  title={element}
                  className={styles.elementBadge}
                />
              ))}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Drop:</span>
              <span className={styles.infoValue}>{formatDrop(entry)}</span>
            </div>
            {entry.riddle && (
              <p className={styles.riddle}>Enigma: {entry.riddle}</p>
            )}
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Passiva:</span>
              <span className={styles.infoValue}>{entry.passiveName}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Skill:</span>
              <span className={styles.infoValue}>{entry.skillName}</span>
            </div>

            {stats && (
              <>
                <div className={styles.xpSection}>
                  <ProgressBar
                    value={stats.xp}
                    max={getPetXPToNextLevel(
                      stats.level,
                      getPetClass(entry.id),
                    )}
                    animationId={`pet-detail-xp-${entry.id}`}
                    level={stats.level}
                  />
                  <div className={styles.xpText}>
                    Nv.{stats.level} &nbsp; {stats.xp} /{" "}
                    {getPetXPToNextLevel(stats.level, getPetClass(entry.id))}
                  </div>
                </div>
              </>
            )}

            <div className={styles.equipStatus}>
              {isEquipped ? (
                <span className={styles.statusEquipped}>
                  Equipado (★{equippedStar})
                </span>
              ) : (
                <span className={styles.statusNotEquipped}>Não equipado</span>
              )}
            </div>

            {message && <div className={styles.message}>{message}</div>}

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
                      FUNDIR (2x ★{eligible})
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
          </div>
        </div>
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
