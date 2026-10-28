import { BabidiEnergyConstants } from "@/data/characters/babidi";
import { spriteMap } from "@/data/battle/projectileSprites";

import type { BabidiEnergyProjectile } from "@/utils/types/character/babidi";

type Props = {
  projectiles: BabidiEnergyProjectile[];
  battleScaleX: number;
  battleScaleY: number;
};

/** Projéteis de energia do ataque básico do babidi (`energyAttack.svg`). */
export function EnergyProjectile({
  projectiles,
  battleScaleX,
  battleScaleY,
}: Props) {
  if (projectiles.length === 0) return null;

  return (
    <>
      {projectiles.map((p) => {
        // A arte base aponta para a direita (mesma convenção do player):
        // voando para a esquerda o sprite espelha. Depois de um portal vertical
        // o voo vira reta para cima (`-90°`) ou para baixo (`90°`).
        const angle = p.dirY < 0 ? -90 : p.dirY > 0 ? 90 : 0;
        const flip = p.dirX < 0 ? " scaleX(-1)" : "";

        return (
          <img
            key={p.id}
            src={spriteMap.energyAttack}
            style={{
              position: "absolute",
              left: p.x * battleScaleX,
              top: p.y * battleScaleY,
              width: BabidiEnergyConstants.SPRITE_WIDTH,
              transform: `translate(-50%, -50%) rotate(${angle}deg)${flip}`,
              zIndex: 15,
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
}
