import type { NpcType } from "@/data/npc/npc";

/**
 * NPCs que entram na batalha **junto** com o NPC principal, cada um com a
 * própria barra de vida (são summons spawnados no início da luta).
 *
 * Diferente de um summon comum, companheiro conta para o fim da luta: enquanto
 * algum estiver vivo, o NPC principal com HP 0 fica caído e a fase (ou a
 * vitória) espera — "fase 2 no momento em que ambas morrem" (issue #298).
 */
export const BATTLE_COMPANIONS: Partial<Record<NpcType, readonly NpcType[]>> = {
  planetarySisters: ["netali"],
};

/**
 * Distância à esquerda do spawn do NPC principal onde o companheiro nasce —
 * perto dele, para a dupla abrir a luta lado a lado.
 */
export const COMPANION_SPAWN_GAP = 150;

/**
 * Companheiros do NPC principal da batalha.
 *
 * @param npcType NPC principal da batalha.
 * @returns Os tipos que entram junto com ele (vazio quando luta sozinho).
 */
export function getBattleCompanions(npcType: string): readonly NpcType[] {
  return BATTLE_COMPANIONS[npcType as NpcType] ?? [];
}

/**
 * Diz se algum companheiro do NPC principal ainda está de pé.
 *
 * @param npcType NPC principal da batalha.
 * @param summons Summons inimigos em campo.
 * @returns `true` enquanto houver companheiro com HP acima de 0.
 */
export function hasCompanionAlive(
  npcType: string,
  summons: readonly SummonedNpc[],
): boolean {
  const companions = getBattleCompanions(npcType);
  if (companions.length === 0) return false;
  return summons.some((s) => s.hp > 0 && companions.includes(s.npcType));
}
