import type { EquipmentRank } from "@/utils/types/player/equipment";

/**
 * Ranks de equipamento cujos pets podem evoluir (fundir estrelas): Lendário
 * (9) e tudo acima dele — Transcendente (0) e Divino (EX). A ordem dos ranks
 * não é numérica (0 e EX vêm depois do 9), por isso a lista é explícita em vez
 * de comparação `>=`. Issue #503.
 */
export const PET_EVOLUTION_RANKS: readonly EquipmentRank[] = [9, 0, "EX"];

/**
 * `true` quando o pet tem rank suficiente para evoluir. É a regra única usada
 * pelo menu (botão de fusão) e pela operação de fusão no storage: se só a UI
 * checasse, um atalho de teclado ou chamada direta furaria a restrição.
 */
export function canPetEvolve(rank: EquipmentRank): boolean {
  return PET_EVOLUTION_RANKS.includes(rank);
}
