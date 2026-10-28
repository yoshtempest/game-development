import { BabidiEnergyConstants } from "@/data/characters/babidi";
import type { BabidiTarget } from "@/utils/types/character/babidi";
import type { BabidiAttackPlan } from "@/utils/types/character/babidi/attack";

/**
 * Há inimigos vivos em cada lado do player (dentro da tolerância vertical)?
 * Presença por lado — não importa a distância horizontal: o projétil atravessa
 * o mapa até o primeiro alvo ou a borda.
 */
export function hasBabidiEnemiesOnBothSides(
  playerX: number,
  playerY: number,
  targets: BabidiTarget[],
): boolean {
  let hasLeft = false;
  let hasRight = false;

  for (const target of targets) {
    if (
      Math.abs(target.y - playerY) > BabidiEnergyConstants.VERTICAL_TOLERANCE
    ) {
      continue;
    }
    if (target.x < playerX) {
      hasLeft = true;
    } else if (target.x > playerX) {
      hasRight = true;
    }
    if (hasLeft && hasRight) return true;
  }

  return false;
}

/**
 * Plano do básico do babidi:
 * - inimigos dos dois lados → `bothSidesAttack` + dois projéteis (um por lado);
 * - caso contrário → uma mão (a `hand` alternada pelo chamador entre golpes) e
 *   um projétil na direção para a qual o player está virado, saindo do lado da
 *   mão que atacou.
 */
export function planBabidiAttack(params: {
  player: Player;
  targets: BabidiTarget[];
  hand: "left" | "right";
  offsetX: number;
  spawnY: number;
}): BabidiAttackPlan {
  const { player, targets, hand, offsetX, spawnY } = params;
  const dirX: 1 | -1 = player.battleDirection === "left" ? -1 : 1;

  if (hasBabidiEnemiesOnBothSides(player.x, player.y, targets)) {
    return {
      variant: "both",
      shots: [
        { dirX: -1, spawnX: player.x - offsetX, spawnY },
        { dirX: 1, spawnX: player.x + offsetX, spawnY },
      ],
    };
  }

  return {
    variant: hand,
    shots: [
      {
        dirX,
        spawnX: player.x + (hand === "left" ? -offsetX : offsetX),
        spawnY,
      },
    ],
  };
}
