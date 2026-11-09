import styles from "@/components/Game/Battle/Replay/styles.module.css";
import { resolveBattleSprite } from "@/utils/paths";
import {
  ALL_PREDICATES,
  resolveSpriteState,
} from "@/gameRules/battle/playerStates";
import type { ReplayFrame } from "@/utils/types/replay";

type Props = {
  frame: ReplayFrame;
  playerSize: number;
};

export function ReplayPlayerSprite({ frame, playerSize }: Props) {
  const isCrouching = ALL_PREDICATES.isCrouched(frame.ps);

  const isFallen = frame.ps === "fallen";

  const playerSrc = resolveBattleSprite(
    frame.pchar,
    resolveSpriteState(frame.ps),
  );

  return (
    <div
      className={styles.sprite}
      style={{
        width: playerSize,
        height: playerSize,
        left: frame.px,
        top: frame.py,
        transform: "translate(-50%, -100%)",
      }}
    >
      <img loading="lazy" decoding="async"
        src={playerSrc}
        style={{
          height: "100%",
          left: "50%",
          bottom: 0,
          transform: `
            translateX(-50%)
            scaleX(${frame.pd === "left" ? -1 : 1})
            ${
              isCrouching
                ? "scale(0.7)"
                : isFallen
                  ? "scale(0.7) translate(0, 20%)"
                  : ""
            }
          `,
        }}
      />
    </div>
  );
}
