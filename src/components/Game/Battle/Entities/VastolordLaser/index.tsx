import { playerProjectilePath } from "@/utils/paths";
import { VASTOLORD_LASER_BEAM_HEIGHT } from "@/data/characters/marshadow/marshadowLaser";
import {
  vastolordLaserTop,
  type VastolordLaserBeam,
} from "@/gameRules/battle/characters/marshadow/vastolordLaser";
import type { BattleEntityPositioning } from "@/components/Game/Battle/Entities/types";

import { BattleBeam } from "@/components/Game/Battle/Entities/Beam";
import styles from "./styles.module.css";

type Props = BattleEntityPositioning & {
  beam: VastolordLaserBeam | null;
  PLAYER_SIZE: number;
};

export function VastolordLaser({
  beam,
  battleScaleX,
  battleScaleY,
  PLAYER_SIZE,
}: Props) {
  if (!beam) return null;

  const width = Math.abs(beam.toX - beam.fromX) * battleScaleX;
  const height = VASTOLORD_LASER_BEAM_HEIGHT * battleScaleY;
  const left = Math.min(beam.fromX, beam.toX) * battleScaleX;
  const top = vastolordLaserTop(beam.y, PLAYER_SIZE) * battleScaleY;

  return (
    <BattleBeam
      battleScaleX={battleScaleX}
      battleScaleY={battleScaleY}
      phase={beam.phase}
      direction={beam.facing}
      left={left}
      top={top}
      width={width}
      height={height}
      pulseAxis="y"
    >
      <img
        src={playerProjectilePath("vastolordLaser.svg")}
        alt=""
        draggable={false}
        className={styles.beam}
      />
    </BattleBeam>
  );
}