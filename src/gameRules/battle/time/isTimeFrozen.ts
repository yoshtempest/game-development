import type { TimeKind } from "./types";
import { getTime } from "./getTime";

/** A entidade está congelada (speed 0)? Atalho para o gate `return` do tick. */
export function isTimeFrozen(
  effects: TimeEffect[],
  kind: TimeKind,
  entityId: string,
  now = Date.now(),
): boolean {
  return getTime(effects, kind, entityId, now).speed === 0;
}
