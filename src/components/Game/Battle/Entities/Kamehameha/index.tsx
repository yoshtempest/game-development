import { playerPathEmatronHabilities } from "@/utils/paths";
import { EMATRON_KAMEHAMEHA_BEAM_HEIGHT } from "@/data/characters/ematron";
import {
  kamehamehaTop,
  type KamehamehaEffect,
} from "@/gameRules/battle/characters/ematron/kamehameha";
import type { BattleEntityPositioning } from "@/components/Game/Battle/Entities/types";

import { BattleBeam } from "@/components/Game/Battle/Entities/Beam";
import styles from "./styles.module.css";

type Props = BattleEntityPositioning & {
  effect: KamehamehaEffect | null;
};

export function Kamehameha({
  effect,
  battleScaleX,
  battleScaleY,
}: Props) {
  if (!effect) return null;

  const width = Math.abs(effect.toX - effect.fromX) * battleScaleX;
  const height = EMATRON_KAMEHAMEHA_BEAM_HEIGHT * battleScaleY;
  const left = Math.min(effect.fromX, effect.toX) * battleScaleX;
  const top = kamehamehaTop(effect.y) * battleScaleY;

  return (
    <BattleBeam
      battleScaleX={battleScaleX}
      battleScaleY={battleScaleY}
      phase={effect.phase}
      direction={effect.facing}
      left={left}
      top={top}
      width={width}
      height={height}
      pulseAxis="x"
      style={{
        transformOrigin:
          effect.facing === "right" ? "left bottom" : "right bottom",
      }}
    >
      <img
        src={playerPathEmatronHabilities("/kamehameha/kamehamehaEffect.svg")}
        alt=""
        draggable={false}
        className={styles.beam}
      />
    </BattleBeam>
  );
}