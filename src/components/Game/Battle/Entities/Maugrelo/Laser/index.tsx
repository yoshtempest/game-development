import type { LaserBeam } from "@/services/npc/attacks/maugrelo/state";
import type { BattleEntityPositioning } from "@/components/Game/Battle/Entities/types";
import styles from "./styles.module.css";

type Props = BattleEntityPositioning & {
  laser: LaserBeam | null;
};

export function Laser({ laser, battleScaleX, battleScaleY }: Props) {
  if (!laser || !laser.active) return null;

  const left = Math.min(laser.fromX, laser.toX) * battleScaleX;
  const width = Math.abs(laser.toX - laser.fromX) * battleScaleX;
  const top = laser.fromY * battleScaleY + 5;

  const growClass = laser.dirX === 1 ? styles.growRight : styles.growLeft;

  return (
    <div
      className={`${styles.container} ${growClass}`}
      style={{
        left,
        top,
        width,
        height: 14,
      }}
    >
      <div className={styles.beam} />
    </div>
  );
}