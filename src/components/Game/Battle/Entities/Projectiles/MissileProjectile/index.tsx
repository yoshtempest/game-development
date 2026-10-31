import { playerProjectilePath } from "@/utils/paths";
import { npcPathProjectile } from "@/utils/paths";
import { babidiPortalPath } from "@/utils/paths";
import type { BabidiMissileProjectile } from "@/utils/types/character/babidi";

type Props = {
  projectiles: BabidiMissileProjectile[];
  battleScaleX: number;
  battleScaleY: number;
};

const EXPLOSION_MS = 400;

export function MissileProjectile({ projectiles, battleScaleX, battleScaleY }: Props) {
  if (projectiles.length === 0) return null;

  return (
    <>
      {projectiles.map((p) => {
        const missileOpacity = p.phase === "exploding" ? 0 : 1;
        const explosionOpacity =
          p.phase === "exploding"
            ? Math.max(0, p.explosionRemaining / EXPLOSION_MS)
            : 0;

        return (
          <div key={p.id} style={{ position: "absolute", pointerEvents: "none" }}>
            {p.phase !== "exploding" && (
              <img
                src={babidiPortalPath("default")}
                style={{
                  position: "absolute",
                  left: p.spawnX * battleScaleX,
                  top: p.spawnY * battleScaleY,
                  width: 90,
                  height: 90,
                  transform: "translate(-50%, -50%)",
                  opacity: 1,
                  zIndex: 14,
                }}
              />
            )}
            {p.phase !== "exploding" && (
              <img
                src={playerProjectilePath("/missile.svg")}
                style={{
                  position: "absolute",
                  left: p.x * battleScaleX,
                  top: p.y * battleScaleY,
                  width: 70,
                  height: 70,
                  transform: `translate(-50%, -50%) rotate(${p.angle}deg)`,
                  opacity: missileOpacity,
                  zIndex: 15,
                }}
              />
            )}
            {p.phase === "exploding" && (
              <img
                src={npcPathProjectile("/explosion.svg")}
                style={{
                  position: "absolute",
                  left: p.x * battleScaleX,
                  top: p.y * battleScaleY,
                  width: 64,
                  height: 64,
                  transform: "translate(-50%, -50%)",
                  opacity: explosionOpacity,
                  zIndex: 16,
                }}
              />
            )}
          </div>
        );
      })}
    </>
  );
}