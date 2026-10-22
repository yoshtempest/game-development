import { spriteMap } from "@/data/battle/projectileSprites";
import type { BattleEntityPositioning } from "@/components/Game/Battle/Entities/types";

type Props = BattleEntityPositioning & {
  playerProjectile: PlayerSpecialProjectile | null;
};

export function SpecialProjectile({
  playerProjectile,
  battleScaleX,
  battleScaleY,
}: Props) {
  if (!playerProjectile) return null;

  return (
    <>
      {playerProjectile.phase === "merge" && (
        <>
          <img
            src={spriteMap.blueSphere}
            style={{
              position: "absolute",
              left: playerProjectile.blueX * battleScaleX,
              top: playerProjectile.blueY * battleScaleY,
              width: 40,
              transform: "translate(-50%, -50%)",
              zIndex: 15,
              pointerEvents: "none",
            }}
          />
          <img
            src={spriteMap.redSphere}
            style={{
              position: "absolute",
              left: playerProjectile.redX * battleScaleX,
              top: playerProjectile.redY * battleScaleY,
              width: 40,
              transform: "translate(-50%, -50%)",
              zIndex: 15,
              pointerEvents: "none",
            }}
          />
        </>
      )}

      {playerProjectile.phase !== "merge" && (
        <img
          src={spriteMap.purpleSphere}
          style={{
            position: "absolute",
            left: playerProjectile.x * battleScaleX,
            top: playerProjectile.y * battleScaleY,
            width: playerProjectile.phase === "move" ? 50 : 60,
            transform: "translate(-50%, -50%)",
            zIndex: 16,
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );
}
