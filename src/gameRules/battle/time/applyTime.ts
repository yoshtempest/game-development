import type { TimeSpec } from "./types";

/**
 * Aplica/renova um efeito (upsert por `id`) e devolve a nova lista. Devolver
 * lista nova em vez de mutar mantém o ref previsível para os consumers.
 */
export function applyTime(
  effects: TimeEffect[],
  spec: TimeSpec,
  now = Date.now(),
): TimeEffect[] {
  const next: TimeEffect[] = [];
  for (const effect of effects) {
    if (effect.id !== spec.id) next.push(effect);
  }
  next.push({
    id: spec.id,
    kinds: spec.kinds,
    exempt: spec.exempt,
    speed: spec.speed,
    cooldown: spec.cooldown,
    until: now + spec.durationMs,
  });
  return next;
}
