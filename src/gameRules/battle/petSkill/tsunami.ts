/** Congelamento mínimo do Tsunami (alvo de vida máxima muito alta). */
export const TSUNAMI_FREEZE_MIN_MS = 3000;

/** Congelamento máximo do Tsunami (alvo de vida máxima muito baixa). */
export const TSUNAMI_FREEZE_MAX_MS = 7000;

/**
 * Vida máxima em que o congelamento fica no meio do intervalo (5s). Escolhido
 * na faixa de HP de um NPC comum de meio de jogo: mobs fracos ficam perto de
 * 7s, chefes de milhares de HP tendem a 3s.
 */
export const TSUNAMI_FREEZE_HP_PIVOT = 1000;

/**
 * Duração do congelamento do Tsunami do Leviathan: quanto mais vida máxima,
 * menos tempo congelado (regra da issue #179). Curva `hp / (hp + pivô)` em vez
 * de uma reta com teto porque não existe um "HP máximo do jogo" estável — a
 * curva nunca passa dos limites e continua diferenciando chefes entre si.
 */
export function getTsunamiFreezeMs(maxHp: number): number {
  const hp = Math.max(0, maxHp);
  const ratio = hp / (hp + TSUNAMI_FREEZE_HP_PIVOT);
  return Math.round(
    TSUNAMI_FREEZE_MAX_MS -
      (TSUNAMI_FREEZE_MAX_MS - TSUNAMI_FREEZE_MIN_MS) * ratio,
  );
}

/**
 * Posição do alvo depois do empurrão: sempre para longe do player. Alvo em
 * cima do player (dx = 0) vai para a direita, o lado de onde os NPCs entram.
 * O clamp na arena fica com quem aplica (`updateNpc` / `clampX`).
 */
export function getTsunamiPushX(
  targetX: number,
  playerX: number,
  distance: number,
): number {
  const dir = targetX >= playerX ? 1 : -1;
  return targetX + dir * distance;
}
