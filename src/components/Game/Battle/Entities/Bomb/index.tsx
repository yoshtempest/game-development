import { useEffect, useRef } from "react";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import type { BattleEntityPositioning } from "@/components/Game/Battle/Entities/types";

type Props = BattleEntityPositioning & {
  bombTargets: BombTarget[];
  bombSprite?: string;
  explosionSprite?: string;
  PLAYER_SIZE: number;
};

export function Bomb({
  bombTargets,
  bombSprite,
  explosionSprite,
  PLAYER_SIZE,
  battleScaleX,
  battleScaleY,
}: Props) {
  const { playSound } = useSoundEffects();
  const explodedBombIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // bomba virou explosion.svg -> explosion.mp3 (uma vez por bomba)
    for (const b of bombTargets) {
      if (b.phase === "explosion" && !explodedBombIdsRef.current.has(b.id)) {
        explodedBombIdsRef.current.add(b.id);
        playSound("explosion");
      }
    }
    const renderedBombIds = new Set(bombTargets.map((b) => b.id));
    for (const id of explodedBombIdsRef.current) {
      if (!renderedBombIds.has(id)) explodedBombIdsRef.current.delete(id);
    }
  }, [bombTargets, playSound]);

  return (
    <>
      {bombTargets.map((b) => (
        <img loading="lazy" decoding="async"
          key={b.id}
          src={
            b.phase === "explosion" && explosionSprite
              ? explosionSprite
              : (bombSprite ?? undefined)
          }
          style={{
            position: "absolute",
            left: b.x * battleScaleX,
            top: b.y * battleScaleY,
            width:
              b.phase === "explosion" ? PLAYER_SIZE * 2 : PLAYER_SIZE * 0.9,
            transform: "translate(-50%, -100%)",
            zIndex: 18,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}
