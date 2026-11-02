import { HITSTOP_ID, ALL_TIME_KINDS } from "./types";
import { applyTime } from "./applyTime";

/**
 * Congelamento global de impacto: o caso degenerado da regra, sem isentos.
 * Substitui o antigo `hitstopRef` (um único timestamp compartilhado por todo
 * mundo) — agora é só mais um efeito na lista.
 */
export function applyHitstop(
  effects: TimeEffect[],
  durationMs: number,
  now = Date.now(),
): TimeEffect[] {
  return applyTime(
    effects,
    {
      id: HITSTOP_ID,
      kinds: ALL_TIME_KINDS,
      exempt: [],
      speed: 0,
      cooldown: 1,
      durationMs,
    },
    now,
  );
}
