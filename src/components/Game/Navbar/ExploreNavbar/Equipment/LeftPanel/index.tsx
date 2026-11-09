import { useRef } from "react";
import { Lock } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { playerPath } from "@/utils/paths";
import { SLOT_LABELS, RANK_COLORS } from "@/data/equipment/definitions";
import { FILTER_LABELS } from "@/utils/equipment/equipmentMenu";
import {
  getItemResistances,
  getWeaponEnchantment,
  HEAT_RESISTANCE_LABEL,
  COLD_RESISTANCE_LABEL,
  BLIND_RESISTANCE_LABEL,
  RESISTANCE_REDUCTION_PER_PIECE_PCT,
} from "@/gameRules/battle/equipment";
import {
  ENCHANTMENT_LABELS,
  ENCHANTMENT_PROC_CHANCE,
} from "@/data/equipment/enchantments";
import styles from "./styles.module.css";
import { useEquipmentMenu } from "@/hooks/menu/equipment/useEquipment";

export function LeftPanel() {
  const { player } = usePlayer();
  const character = player.character;
  const leftPanelRef = useRef<HTMLDivElement | null>(null);
  const rightItemsRef = useRef<HTMLDivElement | null>(null);
  const { selectedIndex, equippedItems } = useEquipmentMenu(
    true,
    character,
    rightItemsRef,
  );

  return (
    <div className={styles.leftPanel}>
      <img loading="lazy" decoding="async"
        src={playerPath(`/${character}/face.svg`)}
        alt={character}
        className={styles.portrait}
      />

      <div className={styles.equippedGrid} ref={leftPanelRef}>
        {equippedItems.map((entry, index) => {
          const isSelected = index === selectedIndex;
          const info = entry.info;
          const item = entry.item;

          const label =
            entry.type === "accessory-slot"
              ? `Acessório ${entry.index + 1}`
              : SLOT_LABELS[entry.slot];

          const slotIcon =
            entry.type === "accessory-slot"
              ? FILTER_LABELS.accessory
              : FILTER_LABELS[entry.slot];

          const key =
            entry.type === "accessory-slot"
              ? `acc-${entry.index}`
              : `slot-${entry.slot}`;

          if (entry.type === "accessory-slot" && entry.locked) {
            return (
              <div
                key={key}
                className={`${styles.equippedCard} ${styles.lockedCard}`}
              >
                <div className={styles.chainLeft} />
                <Lock size={14} className={styles.lockIcon} />
                <img loading="lazy" decoding="async" className={styles.slotIcon} src={slotIcon} alt={label} />
                <div className={styles.chainRight} />
              </div>
            );
          }

          return (
            <div
              key={key}
              className={`${styles.equippedCard} ${isSelected ? "EquipmentSelected" : ""}`}
            >
              <img loading="lazy" decoding="async" className={styles.slotIcon} src={slotIcon} alt={label} />
              {item ? (
                <>
                  <div className="EquipmentItemRow">
                    <span
                      className="EquipmentItemName"
                      style={{ color: RANK_COLORS[item.rank] }}
                    >
                      {item.name}
                      {item.slot === "pet" ? (
                        <span className="EquipmentEnhanceBadge">
                          ★{(info ? info.enhance : 0) + 1}
                        </span>
                      ) : info && info.enhance > 0 ? (
                        <span className="EquipmentEnhanceBadge">
                          +{info.enhance}
                        </span>
                      ) : null}
                    </span>
                  </div>
                  {info &&
                    (() => {
                      const res = getItemResistances(info.id, info.enhance);
                      const labels: string[] = [];
                      if (res.heat)
                        labels.push(
                          `${HEAT_RESISTANCE_LABEL} ${RESISTANCE_REDUCTION_PER_PIECE_PCT}%`,
                        );
                      if (res.cold)
                        labels.push(
                          `${COLD_RESISTANCE_LABEL} ${RESISTANCE_REDUCTION_PER_PIECE_PCT}%`,
                        );
                      if (res.blind)
                        labels.push(
                          `${BLIND_RESISTANCE_LABEL} ${RESISTANCE_REDUCTION_PER_PIECE_PCT}%`,
                        );
                      const enchantment = getWeaponEnchantment(info.id);
                      if (enchantment)
                        labels.push(
                          `${ENCHANTMENT_LABELS[enchantment]} ${ENCHANTMENT_PROC_CHANCE * 100}%`,
                        );
                      if (labels.length === 0) return null;
                      return (
                        <div className={styles.resistanceBadges}>
                          {labels.map((l) => (
                            <span key={l} className={styles.resistanceBadge}>
                              {l}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                </>
              ) : (
                <span className={styles.emptySlot}>Vazio</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
