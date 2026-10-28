import { BABIDI_CHARACTER } from "@/gameRules/battle/characters/babidi/babidiBlock";

import type { BabidiShieldSide } from "@/utils/types/character/babidi";

/**
 * O block do babidi (Babidi Block) cobre os dois lados: segurando o bloqueio,
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
): BabidiShieldSide {
  return attackerX < playerX ? "left" : "right";
}
