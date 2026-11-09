import { getSpritePath } from "@/utils/npc/getSpritePath";
import { getBossSizeMultiplier } from "@/utils/npc/getSpritePath";
import type { ReplayData } from "@/utils/types/replay";
import styles from "@/components/Game/Battle/Replay/styles.module.css";

type Props = {
  npcType: ReplayData["npcType"];
  frame: ReplayData["frames"][number];
  tileSize: number;
};

export function ReplayNpcSprite({ npcType, frame, tileSize }: Props) {
  const npcSize = tileSize * getBossSizeMultiplier(npcType, frame.npcPhase);

  const npcSrc = getSpritePath(npcType, frame.ns, frame.npcPhase);

  return (
    <img loading="lazy" decoding="async"
      src={npcSrc}
      className={styles.sprite}
      style={{
        width: npcSize,
        height: npcSize,
        left: frame.nx,
        top: frame.ny,
        transform: `translate(-50%, -100%) scaleX(${
          frame.ndir === "right" ? -1 : 1
        })`,
        zIndex: 5,
      }}
    />
  );
}
