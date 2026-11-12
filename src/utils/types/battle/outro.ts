/**
 * Resultado de uma batalha do ponto de vista de **um** lado. O mesmo valor
 * serve para o player e para o NPC; o outro lado sempre tem o oposto
 * (`getOpponentOutroResult`).
 */
export type BattleOutroResult = "victory" | "defeat";
