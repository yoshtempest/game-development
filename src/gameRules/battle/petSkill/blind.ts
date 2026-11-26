/**
 * Cegueira aplicada pelo Tornado de Terra do Peru (issue #180). Guarda a
 * chance junto do fim para o dado do pet (`blindTornado.missChance`) ser a
 * fonte de verdade — o funil de golpe do inimigo não conhece o pet.
 */
export type PetBlind = { until: number; missChance: number };

export const NO_PET_BLIND: PetBlind = { until: 0, missChance: 0 };

/**
 * Chance extra de erro do inimigo contra o player. A rolagem mora aqui para o
 * NPC principal (`useNpcBattle`) e os summons (`useSummonAI`) usarem a mesma
 * regra; cegueira vencida vale 0.
 */
export function getPetBlindMissChance(
  blind: PetBlind | undefined,
  now: number = Date.now(),
): number {
  if (!blind || blind.until <= now) return 0;
  return blind.missChance;
}
