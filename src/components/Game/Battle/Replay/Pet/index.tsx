import { getSpritePath } from "@/utils/npc/getSpritePath";
import type { ReplayData } from "@/utils/types/replay";
import styles from "@/components/Game/Battle/Replay/styles.module.css";

type Props = {
  frame: ReplayData["frames"][number];
  tileSize: number;
};

export function ReplayPet({ frame, tileSize }: Props) {
  if (!frame.petType || frame.petx == null || frame.pety == null) {
    return null;
  }

  const petSrc = getSpritePath(frame.petType, frame.petst ?? "idle", 1);

  return (
    <img loading="lazy" decoding="async"
      src={petSrc}
      className={styles.sprite}
      style={{
        width: tileSize * 0.8,
        height: tileSize * 0.8,
        left: frame.petx,
        top: frame.pety,
        transform: `translate(-50%, -100%) scaleX(${
          frame.petdir === "right" ? -1 : 1
        })`,
        zIndex: 7,
      }}
    />
  );
}
