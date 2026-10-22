import { npcPathProjectile } from "@/utils/paths";
import { STUCK_EXPLOSION_DISAPPEAR_MS } from "@/services/npc/attacks/maugrelo/state";
import type { StuckPaper } from "@/services/npc/attacks/maugrelo/state";
import type { BattleEntityPositioning } from "@/components/Game/Battle/Entities/types";

import styles from "./styles.module.css";

type Props = BattleEntityPositioning & {
  papers: StuckPaper[];
  playerX: number;
  playerY: number;
};

export function StuckPapers({
  papers,
  playerX,
  playerY,
  battleScaleX,
  battleScaleY,
}: Props) {
  return (
    <>
      {papers.map((sp, i) => {
        const exploding = sp.explodeAt != null;
        const elapsed = exploding
          ? Math.max(0, Date.now() - (sp.explodeAt ?? 0))
          : 0;
        const opacity = exploding
          ? Math.max(0, 1 - elapsed / STUCK_EXPLOSION_DISAPPEAR_MS)
          : 1;

        return (
          <img
            key={sp.id}
            className={exploding ? "" : styles.blink}
            src={
              exploding
                ? npcPathProjectile("/explosion.svg")
                : npcPathProjectile("/paper.svg")
            }
            style={{
              position: "absolute",
              left: (playerX + i * 14) * battleScaleX,
              top: (playerY - 70) * battleScaleY,
              width: 60,
              zIndex: 5,
              pointerEvents: "none",
              opacity,
            }}
          />
        );
      })}
    </>
  );
}
