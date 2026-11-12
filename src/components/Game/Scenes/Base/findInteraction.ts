import { isPositionInFront, parseGridKey } from "@/utils/isPositionInFront";

export function findInteraction(
  interactions: Record<string, () => void> | undefined,
  player: Player,
  frontX: number,
  frontY: number,
) {
  if (!interactions) return undefined;

  const exact = interactions[`${frontX},${frontY}`];
  if (exact) return exact;

  let best: { key: string; dist: number } | null = null;
  for (const key in interactions) {
    const pos = parseGridKey(key);
    if (!pos || !isPositionInFront(player, pos.x, pos.y)) continue;
    const dist = (pos.x - frontX) ** 2 + (pos.y - frontY) ** 2;
    if (!best || dist < best.dist) best = { key, dist };
  }
  return best ? interactions[best.key] : undefined;
}
