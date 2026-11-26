import type { NpcType } from "@/data/npc/npc";

/**
 * Quantas fases um NPC tem antes de morrer de verdade.
 *
 * Todo `boss` sempre teve duas fases (o lifecycle reenche a vida e avança
 * para a fase 2). NPC com outra contagem — o Evil Morty é `supreme` e tem
 * três — declara aqui, para o lifecycle e a Expansão de Domínio do jogador
 * concordarem sobre quando a luta acaba de verdade.
 */
export const NPC_PHASE_COUNTS: Partial<Record<NpcType, number>> = {
  evilMorty: 3,
};

/** Fases de um `boss` sem entrada em `NPC_PHASE_COUNTS`. */
export const DEFAULT_BOSS_PHASE_COUNT = 2;

/**
 * Número de fases do NPC: a entrada explícita vence; sem ela, `boss` tem
 * `DEFAULT_BOSS_PHASE_COUNT` e qualquer outra classe tem uma só.
 */
export function getNpcPhaseCount(npcType: string, npcClass: string): number {
  const explicit = NPC_PHASE_COUNTS[npcType as NpcType];
  if (explicit !== undefined) return explicit;
  return npcClass === "boss" ? DEFAULT_BOSS_PHASE_COUNT : 1;
}
