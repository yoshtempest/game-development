/** Encerra um efeito antes do prazo (cleanup de habilidade). */
export function clearTime(effects: TimeEffect[], id: string): TimeEffect[] {
  if (!effects.some((effect) => effect.id === id)) return effects;
  return effects.filter((effect) => effect.id !== id);
}
