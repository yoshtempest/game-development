import { LucauaEnergyConstants } from "@/data/characters/lucaua";
import type {
  LucauaAttackVariant,
  LucauaTarget,
} from "@/utils/types/character/lucaua";

/** Um disparo do plano: direção e posição de spawn no mapa da batalha. */
export type LucauaAttackShot = {
  dirX: 1 | -1;
  spawnX: number;
  spawnY: number;
};

/** Plano do básico do lucaua: sprite de ataque + os projéteis a gerar. */
export type LucauaAttackPlan = {
  variant: LucauaAttackVariant;
  shots: LucauaAttackShot[];
};

/**
 * Há inimigos vivos em cada lado do player (dentro da tolerância vertical)?
 * Presença por lado — não importa a distância horizontal: o projétil atravessa
 * o mapa até o primeiro alvo ou a borda.
 */
export function hasLucauaEnemiesOnBothSides(
  playerX: number,
  playerY: number,
  targets: LucauaTarget[],
): boolean {
  let hasLeft = false;
  let hasRight = false;

  for (const target of targets) {
    if (
      Math.abs(target.y - playerY) > LucauaEnergyConstants.VERTICAL_TOLERANCE
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
 * Plano do básico do lucaua:
 * - inimigos dos dois lados → `bothSidesAttack` + dois projéteis (um por lado);
 * - caso contrário → uma mão (a `hand` alternada pelo chamador entre golpes) e
 *   um projétil na direção para a qual o player está virado, saindo do lado da
 *   mão que atacou.
 */
export function planLucauaAttack(params: {
  player: Player;
  targets: LucauaTarget[];
  hand: "left" | "right";
  offsetX: number;
  spawnY: number;
}): LucauaAttackPlan {
  const { player, targets, hand, offsetX, spawnY } = params;
  const dirX: 1 | -1 = player.battleDirection === "left" ? -1 : 1;

  if (hasLucauaEnemiesOnBothSides(player.x, player.y, targets)) {
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
