import { npcPathProjectile, playerAbilityPath } from "@/utils/paths";
import { playerProjectilePath } from "@/utils/paths";
import type { BabidiMissileProjectile } from "@/utils/types/character/babidi";
import styles from "./styles.module.css";

type Props = {
  projectiles: BabidiMissileProjectile[];
  battleScaleX: number;
  battleScaleY: number;
};

const EXPLOSION_MS = 400;

export function MissileProjectile({
  projectiles,
  battleScaleX,
  battleScaleY,
}: Props) {
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
            {p.phase !== "exploding" && !p.noPortal && (
              <div
                className={styles.portal}
                style={{
                  left: p.spawnX * battleScaleX,
                  top: p.spawnY * battleScaleY,
                  opacity: 1,
                }}
              >
                <img loading="lazy" decoding="async"
                  src={playerAbilityPath("babidi", "portals", "defaultPortal.svg")}
                  className={styles.portalFlip}
                />
              </div>
            )}
            {p.phase !== "exploding" && (
              <img loading="lazy" decoding="async"
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
              <img loading="lazy" decoding="async"
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
