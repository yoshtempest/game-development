import { isPlayerInRange } from "@/gameRules/battle/range";
import { isFacingTarget } from "@/gameRules/battle/direction";
import { NPC_CLASS_VERTICAL_BONUS } from "@/gameRules/battle/range/config";
import { MARSHADOW_CHARACTER_ID } from "./constants";

type CutParams = {
  projectile: ProjectileCommon | ProjectilePull;
  playerX: number;
  playerY: number;
  playerState: PlayerState;
  playerCharacter: string;
  playerDirection: Direction;
  npcClass: NPCClass;
};

/** Chance de 10% do Marshadow cortar um projétil com o ataque normal. */
export const MARSHADOW_CUT_CHANCE = 1;

/**
 * Direções dos fragmentos após o corte (coordenadas de tela, +y para baixo).
 *
 * - Superior: sobe para a esquerda (~135° no sentido trigonométrico)
 * - Inferior: desce para a esquerda (~225°)
 */
/** Direções dos fragmentos (magnitude) após o corte, em coordenadas de tela. */

/**
 * Decide se um projétil deve ser cortado.
 *
 * Condições: o jogador é o Marshadow, está atacando (state "attack"), o
 * projétil está dentro do alcance do ataque normal e frente ao jogador, e o
 * roll de 10% passa.
 */
export function shouldCutProjectile({
  projectile,
  playerX,
  playerY,
  playerState,
  playerCharacter,
  playerDirection,
  npcClass,
}: CutParams): boolean {
  if (playerCharacter !== MARSHADOW_CHARACTER_ID) return false;
  if (playerState !== "attack") return false;

  const inRange = isPlayerInRange(
    playerX,
    playerY,
    projectile.x,
    projectile.y,
    playerState,
    playerCharacter,
    false,
    false,
    npcClass,
  );
  if (!inRange) return false;

  const verticalRange = 150 + (NPC_CLASS_VERTICAL_BONUS[npcClass] ?? 0);

  const facing = isFacingTarget(
    playerX,
    playerY,
    projectile.x,
    projectile.y,
    playerDirection,
    npcClass,
    verticalRange,
  );
  if (!facing) return false;

  return Math.random() < MARSHADOW_CUT_CHANCE;
}
