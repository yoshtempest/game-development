import { getSpritePath } from "@/utils/npc/getSpritePath";
import type { ReplayData } from "@/utils/types/replay";
import styles from "@/components/Game/Battle/Replay/styles.module.css";

type Summon = ReplayData["frames"][number]["sm"][number];

type Props = {
  summons: Summon[];
  tileSize: number;
};

export function ReplaySummons({ summons, tileSize }: Props) {
  return (
    <>
      {summons.map((summon) => (
        <img loading="lazy" decoding="async"
          key={summon.id}
          src={getSpritePath(summon.t, summon.st, 1)}
          className={styles.sprite}
          style={{
            width: tileSize,
            height: tileSize,
            left: summon.x,
            top: summon.y,
            transform: `translate(-50%, -100%) scaleX(${
              summon.dir === "right" ? -1 : 1
            })`,
            zIndex: 6,
          }}
        />
      ))}
    </>
  );
}
