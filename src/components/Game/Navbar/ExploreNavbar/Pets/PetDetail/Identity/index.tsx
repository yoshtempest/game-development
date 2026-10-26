import {
  RANK_COLORS,
  RANK_LABELS,
} from "@/data/equipment/definitions";
import { RANKS } from "@/gameRules/rank";
import { rankBadgePath } from "@/utils/paths";
import type { PetEntry } from "@/hooks/menu/pets/usePetsMenu";
import styles from "./styles.module.css";
import shared from "../styles.module.css";

type Props = {
  entry: PetEntry;
};

export function PetIdentity({ entry }: Props) {
  const rank = RANKS.find((item) => item.id === entry.rank);

  return (
    <div className={styles.nameBlock}>
      <span className={shared.sectionEyebrow}>
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
          src={rankBadgePath(rank?.src ?? "wandering.svg")}
          alt={`Rank ${RANK_LABELS[entry.rank]}`}
        />

        <span
          className={styles.rankName}
          style={{ color: RANK_COLORS[entry.rank] }}
        >
          Rank: {RANK_LABELS[entry.rank]}
        </span>
      </div>
    </div>
  );
}