import type { NpcType } from "@/data/npc/npc";

export const NPC_LEVELS: Partial<Record<NpcType, number>> = {
  jhowsimar: 1,
  vandinhaFragment: 3,
  deise: 7,
  maugrelo: 9,
  slimita: 5,
  manim: 16,
  denis: 18,
  srGuaxinim: 10,
  trueVandinha: 50,
  hungryKing: 11,
  neimito: 13,
  planetarySisters: 14,
  netali: 14,
};

export function getNpcLevel(npcType: string): number {
  return NPC_LEVELS[npcType as NpcType] ?? 1;
}
