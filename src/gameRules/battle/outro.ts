import type { NPCClass } from "@/data/npc/class";
import type { BattleOutroResult } from "@/utils/types/battle/outro";

/** Classes que merecem a sequência completa de fim de batalha. */
const BATTLE_OUTRO_CLASSES: ReadonlySet<NPCClass> = new Set([
  "boss",
  "legendary",
  "supreme",
  "omega",
]);

/**
 * BattleOutro é privilégio de confronto importante: NPC alfa (mesmo de classe
 * baixa) ou classe boss/acima. NPCs comuns/raros/épicos normais vão direto para
 * o modal de resultado — sem retrato, fala e sprite de outro na arena.
 *
 * A regra fica fora dos componentes para que o hook que monta o modal, a cena
 * que escolhe o sprite do player e o renderer do NPC decidam a mesma coisa.
 */
export function canHaveBattleOutro(
  npcClass: NPCClass,
  isAlfa: boolean,
): boolean {
  return isAlfa || BATTLE_OUTRO_CLASSES.has(npcClass);
}

/**
 * Resultado do lado oposto ao informado.
 *
 * A batalha guarda o resultado só do ponto de vista do player
 * (`showOutro`/`outroExpression`); o NPC precisa do inverso para escolher o
 * sprite (`victory.svg` quando derrotou o player) e o som do outro.
 * Centralizar a inversão evita que a arena e o modal discordem sobre qual
 * lado venceu.
 */
export function getOpponentOutroResult(
  result: BattleOutroResult,
): BattleOutroResult {
  return result === "victory" ? "defeat" : "victory";
}
