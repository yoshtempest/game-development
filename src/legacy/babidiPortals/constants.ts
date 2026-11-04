import {
  EIGHT_HUNDRED_MS,
  FOUR_HUNDRED_MS,
  SIXTEEN_MS,
} from "@/data/ms";
import type { BabidiPortalKind } from "@/legacy/babidiPortals/types";

/**
 * Constantes da mecânica arquivada de dois portais + teletransporte.
 *
 * Ficam junto do código para que reativar a mecânica no futuro não dependa de
 * valores que hoje pertencem à habilidade simples (portal + bomba).
 */
export const BabidiPortalConstants = {
  COST_RATIO: 0.25,
  MAX_PORTALS: 2,
  AIR_HEIGHT: 400,
  MOVE_PX: 5,
  TICK_MS: SIXTEEN_MS,
  FLIGHT_MS: FOUR_HUNDRED_MS,
  SPRITE_WIDTH: 130,
  TRIGGER_HALF_X: 55,
  TRIGGER_HALF_Y: 160,
  GROUND_ENTER_MARGIN: 24,
  LANDING_MS: FOUR_HUNDRED_MS,
  GROUND_FALL_DEPTH: 200,
  FALL_GRAVITY: 1,
  FALL_MAX_MS: EIGHT_HUNDRED_MS,
} as const;

/** Ordem dos tipos no seletor de portal (o índice inicial é o `default`). */
export const BABIDI_PORTAL_KINDS: readonly BabidiPortalKind[] = [
  "ground",
  "default",
  "air",
];
