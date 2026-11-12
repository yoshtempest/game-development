import type { InventoryItem } from "@/utils/types/player/inventory";

/** Raios da roda: nove esferas antes do leme (issue #444). */
export const DHARMA_SPHERES_REQUIRED = 9;

export type DharmaDropId = "dharma_sphere" | "dharma_wheel";

/**
 * Drop garantido (100%) do Mahoraga: esfera até o jogador ter nove no
 * inventário; depois, o leme. Lê o inventário em vez de um contador próprio
 * porque a regra da issue é "após ter as 9 esferas no inventário" — se o
 * jogador gastar uma, a próxima vitória volta a dar esfera.
 *
 * Decisão para revisar: com as nove esferas e o leme em mãos, não cai mais
 * nada do Dharma (`null`) — evita acumular peça que não serve para nada.
 */
export function getMahoragaDharmaDrop(
  items: readonly InventoryItem[],
): DharmaDropId | null {
  const spheres = items
    .filter((item) => item.id === "dharma_sphere")
    .reduce((total, item) => total + (item.qty ?? 1), 0);

  if (spheres < DHARMA_SPHERES_REQUIRED) return "dharma_sphere";
  if (!items.some((item) => item.id === "dharma_wheel")) return "dharma_wheel";
  return null;
}
