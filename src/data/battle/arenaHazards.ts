import type { NpcType } from "@/data/npc";

/**
 * Fração da vida **máxima** do jogador que a arena tira por segundo, por
 * batalha. É perigo do mapa (o fogo que o Denis ateia na diretoria, #301), não
 * golpe do NPC: por isso fica fora do `services/npc/attacks` e continua
 * queimando enquanto o NPC está parado, conjurando ou levando hit.
 *
 * Porcentagem da vida máxima (e não número fixo) para a pressão ser a mesma em
 * qualquer nível de personagem — 1%/s é o valor pedido na issue.
 */
export const ARENA_BURN_FRACTION: Partial<Record<string, number>> = {
  denis: 0.01,
} satisfies Partial<Record<NpcType, number>>;
