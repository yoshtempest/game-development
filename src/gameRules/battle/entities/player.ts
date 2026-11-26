export function getPlayerMaxHp(baseHp: number) {
  return 90 + baseHp * 15;
}

/**
 * `statsResistance` alimenta a vida desde que HP virou stat derivado dela — o
 * parametro foi renomeado junto para o nome não mentir sobre a origem do valor.
 */
export function computeMaxHp(
  statsResistance: number,
  equipmentHp: number,
  titleHp: number,
  titleAllStatsPct: number,
  rankMultiplier: number,
  hungerMultiplier: number,
): number {
  const allStatsPct = 1 + titleAllStatsPct / 100;
  const effectiveHp =
    (statsResistance + equipmentHp + titleHp) *
    allStatsPct *
    rankMultiplier *
    hungerMultiplier;
  return 90 + Math.round(effectiveHp) * 10;
}
