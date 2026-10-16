import { BABIDI_CHARACTER } from "@/gameRules/battle/babidiBlock";

import type { LucauaShieldSide } from "@/utils/types/character/lucaua";

/**
 * O block do lucaua (Babidi Block) cobre os dois lados: segurando o bloqueio,
 * o golpe é absorvido mesmo quando ele não está virado para quem ataca. Sem
 * isso o `shield.svg` nunca apareceria em golpes vindos pelas costas.
 */
export function blocksOmnidirectionally(character: CharacterId): boolean {
  return character === BABIDI_CHARACTER;
}

/**
 * Lado em que o shield surge: o do ATACANTE em relação ao player, não o lado
 * para onde o player está virado. Quem está à esquerda (`attackerX < playerX`)
 * ataca pela esquerda.
 */
export function getShieldSide(
  attackerX: number,
  playerX: number,
): LucauaShieldSide {
  return attackerX < playerX ? "left" : "right";
}
