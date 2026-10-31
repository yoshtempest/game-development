import { playerProjectilePath } from "@/utils/paths";
import { npcPathProjectile } from "@/utils/paths";
import { babidiPortalPath } from "@/utils/paths";
import type { BabidiMissileProjectile } from "@/utils/types/character/babidi";
import styles from "./styles.module.css"

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
          <div key={p.id} className={styles.container}>
            {p.phase !== "exploding" && (
              <div className={styles.portal}
                style={{
                  left: p.spawnX * battleScaleX,
                  top: p.spawnY * battleScaleY,
                  opacity: 1,
                }}>
                <img
                  src={babidiPortalPath("default")}
                  className={styles.portalFlip}
                />
              </div>
            )}
            {p.phase !== "exploding" && (
              <img
                src={playerProjectilePath("/missile.svg")}
                className={styles.missile}
                style={{
                  left: p.x * battleScaleX,
                  top: p.y * battleScaleY,
                  transform: `rotate(${p.angle}deg)`,
                  opacity: missileOpacity,
                }}
              />
            )}
            {p.phase === "exploding" && (
              <img
                src={npcPathProjectile("/explosion.svg")}
                className={styles.explosion}
                style={{
                  left: p.x * battleScaleX,
                  top: p.y * battleScaleY,
                  opacity: explosionOpacity,
                }}
              />
            )}
          </div>
        );
      })}
    </>
  );
}