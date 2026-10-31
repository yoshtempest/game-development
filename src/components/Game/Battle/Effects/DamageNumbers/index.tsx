import styles from "./styles.module.css";
import { findDamageTarget } from "@/utils/battle/findDamageTarget";
import { titleBadgePath } from "@/utils/paths";
import { type DamageNumbersProps, TYPE_CLASS } from "./constants";

export type { DamageTarget } from "@/utils/battle/findDamageTarget";

const HEAD_GAP = 8;
/** Tipos que não pertencem a um personagem: ficam no ponto do projétil. */
const NO_SNAP_TYPES = new Set<string>(["projectile"]);
const NO_SNAP_OFFSET = 20;

export function DamageNumbers({ numbers, scaleX, scaleY, targets }: DamageNumbersProps) {
  return (
    <>
      {numbers.map((n) => {
        const noSnap = NO_SNAP_TYPES.has(n.type);
        const target = noSnap ? undefined : findDamageTarget(n.x, n.y, targets);
        const headOffset = noSnap
          ? NO_SNAP_OFFSET
          : target
            ? target.h + HEAD_GAP
            : 80;
        const value = Math.round(n.value);
        return (
          <div
            key={n.id}
            className={`${styles.number} ${TYPE_CLASS[n.type] ?? styles.npc}`}
            style={{
              left: n.x * scaleX,
              top: n.y * scaleY - headOffset,
              translate: "-50% 0",
            }}
          >
            {n.type === "crit" ? (
              <div className={styles.critBackground}>
                <span className={styles.critLabel}>CRITICAL!</span>

                <span className={styles.critText}>
                  {value > 0 ? `-${value}` : "0"}
                </span>
              </div>
            ) : n.type === "blocked" ? (
              "BLOCKED!"
            ) : n.type === "parry" ? (
              "PARRY!"
            ) : n.type === "miss" ? (
              "MISS!"
            ) : n.type === "heal" ? (
              `+${value}`
            ) : n.type === "armor" ? (
              <>
                <img
                  src={titleBadgePath("blockAttacks.svg")}
                  className={styles.image}
                />
                +1
              </>
            ) : value > 0 ? (
              `-${value}`
            ) : (
              "0"
            )}
          </div>
        );
      })}
    </>
  );
}
