import { useRef } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useEquipmentMenu } from "@/hooks/menu/equipment/useEquipment";
import type { CollectedEntry } from "@/utils/types/equipment/entrys";
import {
  getItemResistances,
  HEAT_RESISTANCE_LABEL,
  COLD_RESISTANCE_LABEL,
  BLIND_RESISTANCE_LABEL,
  RESISTANCE_REDUCTION_PER_PIECE_PCT,
} from "@/gameRules/battle/equipment";
import {
  EQUIPPED_COUNT,
  FILTER_TAB_COUNT,
  FILTER_TABS,
  FILTER_LABELS,
} from "@/utils/equipment/equipmentMenu";
import { RANK_COLORS, RANK_LABELS } from "@/data/equipment/definitions";
import styles from "./styles.module.css";

export function RightPanel() {
  const { player } = usePlayer();
  const character = player.character;
  const rightItemsRef = useRef<HTMLDivElement | null>(null);
  const { selectedIndex, filteredItems, filter } = useEquipmentMenu(
    true,
    character,
    rightItemsRef,
  );

  return (
    <div className={styles.rightPanel}>
      <div className={styles.filterTabs}>
        {FILTER_TABS.map((tab, i) => {
          const globalIndex = EQUIPPED_COUNT + i;
          const isSelected = globalIndex === selectedIndex;
          const isActive = tab === filter;

          return (
            <div
              key={tab}
              className={`${styles.filterTab} ${isActive ? styles.filterTabActive : ""} ${isSelected ? "EquipmentSelected" : ""}`}
            >
              <img
                loading="lazy"
                decoding="async"
                className={styles.equipmentImage}
                src={FILTER_LABELS[tab]}
              />
            </div>
          );
        })}
      </div>

      <div
        className={`${styles.itemsContainer} hideScrollbar`}
        ref={rightItemsRef}
      >
        {filteredItems.length === 0 && (
          <div className={styles.emptyText}>Nenhum equipamento encontrado.</div>
        )}

        {filteredItems.map((entry: CollectedEntry, index) => {
          const globalIndex = EQUIPPED_COUNT + FILTER_TAB_COUNT + index;
          const isSelected = globalIndex === selectedIndex;

          return (
            <div
              key={`collected-${entry.item.id}+${entry.enhance}`}
              className={`${styles.collectedCard} ${isSelected ? "EquipmentSelected" : ""}`}
            >
              <div className="EquipmentItemRow">
                <img
                  loading="lazy"
                  decoding="async"
                  className="slotTag"
                  src={FILTER_LABELS[entry.item.slot]}
                />
                {entry.arrow === "up" && (
                  <ArrowUp size={14} className={styles.arrowUp} />
                )}
                {entry.arrow === "down" && (
                  <ArrowDown size={14} className={styles.arrowDown} />
                )}
                <span
                  className="EquipmentItemName"
                  style={{ color: RANK_COLORS[entry.item.rank] }}
                >
                  {entry.item.name}
                  {entry.item.slot === "pet" ? (
                    <span className="EquipmentEnhanceBadge">
                      ★{entry.enhance + 1}
                    </span>
                  ) : entry.enhance > 0 ? (
                    <span className="EquipmentEnhanceBadge">
                      +{entry.enhance}
                    </span>
                  ) : null}
                </span>
                <span className={styles.qtyBadge}>x{entry.qty}</span>
                <span
                  className={styles.rankLabel}
                  style={{ color: RANK_COLORS[entry.item.rank] }}
                >
                  {RANK_LABELS[entry.item.rank]}
                </span>
              </div>
              <span className={styles.stats}>
                HP: +{entry.stats.hp} | For: +{entry.stats.strength}
                {entry.stats.technique > 0
                  ? ` | Téc: +${entry.stats.technique}`
                  : ""}
                {entry.stats.spirit > 0 ? ` | Esp: +${entry.stats.spirit}` : ""}
                {entry.stats.cooldownReduction > 0
                  ? ` | CDR: +${entry.stats.cooldownReduction}%`
                  : ""}
                {entry.stats.armor > 0 ? ` | Arm: +${entry.stats.armor}` : ""}
                {entry.stats.maxHpDamage > 0
                  ? ` | DanoHP: +${entry.stats.maxHpDamage}%`
                  : ""}
                {entry.stats.trueDamage > 0
                  ? ` | DanoV: +${entry.stats.trueDamage}`
                  : ""}
              </span>
              {(() => {
                const res = getItemResistances(entry.item.id, entry.enhance);
                const badges: string[] = [];
                if (res.heat)
                  badges.push(
                    `${HEAT_RESISTANCE_LABEL} ${RESISTANCE_REDUCTION_PER_PIECE_PCT}%`,
                  );
                if (res.cold)
                  badges.push(
                    `${COLD_RESISTANCE_LABEL} ${RESISTANCE_REDUCTION_PER_PIECE_PCT}%`,
                  );
                if (res.blind)
                  badges.push(
                    `${BLIND_RESISTANCE_LABEL} ${RESISTANCE_REDUCTION_PER_PIECE_PCT}%`,
                  );
                if (badges.length === 0) return null;
                return (
                  <span className={styles.resistanceBadges}>
                    {badges.map((b) => (
                      <span key={b} className={styles.resistanceBadge}>
                        {b}
                      </span>
                    ))}
                  </span>
                );
              })()}
              <span className={styles.actionHint}>Confirmar: Equipar</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
