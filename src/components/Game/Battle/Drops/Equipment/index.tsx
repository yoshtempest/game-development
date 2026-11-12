import styles from "./styles.module.css";
import { RANK_LABELS, SLOT_LABELS } from "@/data/equipment/definitions";
import { RANKS } from "@/gameRules/rank";
import {
  getItemResistances,
  HEAT_RESISTANCE_LABEL,
  COLD_RESISTANCE_LABEL,
  BLIND_RESISTANCE_LABEL,
  RESISTANCE_REDUCTION_PER_PIECE_PCT,
} from "@/gameRules/battle/equipment";
import { FILTER_LABELS } from "@/utils/equipment/equipmentMenu";
import { rankBadgePath } from "@/utils/paths";
import type { EquipmentDropInfo } from "@/hooks/battle/rewards/useRewards";

type Props = {
  equipmentDrops: EquipmentDropInfo[];
};

export function EquipmentDrops({ equipmentDrops }: Props) {
  if (equipmentDrops.length === 0) return null;

  return (
    <div className="section">
      <h2 className="sectionTitle">Equipamentos Dropados</h2>
      <div className="dropsList">
        {equipmentDrops.map((eq) => {
          const res = getItemResistances(eq.id, eq.enhance);
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

          const rank = RANKS.find((r) => String(r.id) === String(eq.rank));

          return (
            <div key={eq.id} className="dropItem">
              {rank?.src && (
                <img
                  loading="lazy"
                  decoding="async"
                  className="dropIcon"
                  src={rankBadgePath(rank.src)}
                  alt={RANK_LABELS[eq.rank]}
                  title={RANK_LABELS[eq.rank]}
                />
              )}
              <img
                loading="lazy"
                decoding="async"
                className="dropIcon"
                src={FILTER_LABELS[eq.slot]}
                alt={SLOT_LABELS[eq.slot]}
                title={SLOT_LABELS[eq.slot]}
              />
              <span className="dropName">
                {eq.name}
                {eq.enhance > 0 ? (
                  <span className={styles.enhanceBadge}>+{eq.enhance}</span>
                ) : null}
              </span>
              {labels.length > 0 && (
                <span className={styles.resistanceBadges}>
                  {labels.map((l) => (
                    <span key={l} className={styles.resistanceBadge}>
                      {l}
                    </span>
                  ))}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
