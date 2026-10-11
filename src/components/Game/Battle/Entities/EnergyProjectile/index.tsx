import { LucauaEnergyConstants } from "@/data/characters/lucaua/lucaua";
import { spriteMap } from "@/data/battle/projectileSprites";

import type { LucauaEnergyProjectile } from "@/utils/types/character/lucaua";

type Props = {
  projectiles: LucauaEnergyProjectile[];
  battleScaleX: number;
  battleScaleY: number;
};

/** Projéteis de energia do ataque básico do lucaua (`energyAttack.svg`). */
export function EnergyProjectile({
  projectiles,
  battleScaleX,
  battleScaleY,
}: Props) {
  if (projectiles.length === 0) return null;

  return (
    <>
      {projectiles.map((p) => (
        <img
          key={p.id}
          src={spriteMap.energyAttack}
          style={{
            position: "absolute",
            left: p.x * battleScaleX,
            top: p.y * battleScaleY,
            width: LucauaEnergyConstants.SPRITE_WIDTH,
            // A arte base aponta para a direita (mesma convenção do player):
            // voando para a esquerda o sprite espelha.
            transform: `translate(-50%, -50%) ${p.dirX === -1 ? "scaleX(-1)" : ""}`,
            zIndex: 15,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}