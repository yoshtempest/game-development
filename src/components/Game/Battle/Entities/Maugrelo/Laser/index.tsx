import type { LaserBeam } from "@/services/npc/attacks/maugrelo/state";
import type { BattleEntityPositioning } from "@/components/Game/Battle/Entities/types";

import { BattleBeam } from "@/components/Game/Battle/Entities/Beam";
import styles from "./styles.module.css";

type Props = BattleEntityPositioning & {
  laser: LaserBeam | null;
};

export function Laser({
  laser,
  battleScaleX,
  battleScaleY,
}: Props) {
  if (!laser || !laser.active) return null;

  const left = Math.min(laser.fromX, laser.toX) * battleScaleX;
  const width = Math.abs(laser.toX - laser.fromX) * battleScaleX;
  const top = laser.fromY * battleScaleY + 5;

  return (
    <BattleBeam
      battleScaleX={battleScaleX}
      battleScaleY={battleScaleY}
      phase={laser.phase}
      direction={laser.dirX === 1 ? "right" : "left"}
      left={left}
      top={top}
      width={width}
      height={14}
      zIndex={6}
      pulseAxis="y"
      animationDuration={500}
    >
      <div className={styles.beam} />
    </BattleBeam>
  );
}