import { timeSinceParryInput } from "./timeSinceParryInput";
import { PARRY_WINDOW_MS } from "./blocking/useBlocking";

export function isParryPress(
  ...pressRefs: (React.RefObject<number> | undefined)[]
): boolean {
  return timeSinceParryInput(...pressRefs) <= PARRY_WINDOW_MS;
}
