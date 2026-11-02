import { type TimeKind, type BattleTime, NEUTRAL_TIME } from "./types";

/**
 * Estado de tempo de uma entidade agora: o pior caso entre os efeitos ativos que
 * a atingem. `entityId` só é usado para checar `exempt` — um efeito sem isentos
 * vale para toda a classe.
 */
export function getTime(
  effects: TimeEffect[],
  kind: TimeKind,
  entityId: string,
  now = Date.now(),
): BattleTime {
  let speed = 1;
  let cooldown = 1;

  for (const effect of effects) {
    if (effect.until <= now) continue;
    if (!effect.kinds.includes(kind)) continue;
    if (effect.exempt.includes(entityId)) continue;
    if (effect.speed < speed) speed = effect.speed;
    if (effect.cooldown > cooldown) cooldown = effect.cooldown;
  }

  return speed === 1 && cooldown === 1 ? NEUTRAL_TIME : { speed, cooldown };
}
