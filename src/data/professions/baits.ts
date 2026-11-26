import type { BAITS } from "@/data/items/profession/baits";

export type BaitId = keyof typeof BAITS;

/**
 * Natureza da isca (issue #146): a de batalha garante um inimigo no anzol, a
 * de recurso garante um recurso coletado. Sem isca a pesca segue a chance
 * base de monstro.
 */
export type BaitKind = "battle" | "resource";

/**
 * Qualidade de 1 (pior) a 4 (melhor). Só faz diferença em isca de batalha:
 * quanto melhor, maior a chance de o monstro fisgado ser o forte (issue #138).
 */
export type BaitQuality = 1 | 2 | 3 | 4;

export type BaitEffect = {
  kind: BaitKind;
  quality: BaitQuality;
};

/**
 * Efeito de cada isca. `satisfies Record<BaitId, …>` faz isca nova sem efeito
 * declarado quebrar o build, como os outros registros exaustivos do jogo.
 */
export const BAIT_EFFECTS = {
  bait_worm: { kind: "battle", quality: 1 },
  bait_shrimp: { kind: "battle", quality: 2 },
  bait_glowing: { kind: "battle", quality: 3 },
  bait_abyssal: { kind: "battle", quality: 4 },
  bait_bread: { kind: "resource", quality: 1 },
} as const satisfies Record<BaitId, BaitEffect>;

/** Diz se um item da mochila é isca, para a UI filtrar o seletor de isca. */
export function isBaitId(id: string): id is BaitId {
  return id in BAIT_EFFECTS;
}
