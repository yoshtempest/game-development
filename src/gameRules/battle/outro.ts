import type { BattleOutroResult } from "@/utils/types/battle/outro";

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
