import { BabidiPortalConstants } from "@/data/characters/babidi";
import { BATTLE_LIMITS } from "@/gameRules/movement/constants";
import type { BabidiPortalKind } from "@/utils/types/character/babidi";

/** Limita o X do portal/fantasma às bordas jogáveis do campo de batalha. */
export function clampPortalX(x: number): number {
  return Math.max(BATTLE_LIMITS.minX, Math.min(x, BATTLE_LIMITS.maxX));
}

/**
 * Próximo índice do seletor de tipos, em ciclo. Esquerda/direita dão a volta
 * (`delta` negativo/positivo); o `+ total` mantém o resultado positivo mesmo com
 * o índice em 0 indo para a esquerda.
 */
export function cyclePortalSelection(
  current: number,
  delta: number,
  total: number,
): number {
  return (current + delta + total) % total;
}

/**
 * `y` "livre" do fantasma depois do empurrão vertical do joystick.
 *
 * Só o portal frontal (`default`) flutua livremente; o aéreo é sempre derivado
 * da altura e o terrestre fica no chão — nesses dois o vertical não muda nada.
 */
export function freeGhostY(
  kind: BabidiPortalKind,
  y: number,
  dy: number,
): number {
  return kind === "default" ? y + dy * BabidiPortalConstants.MOVE_PX : y;
}
