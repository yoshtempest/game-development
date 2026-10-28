import { calculateSpecialHitDamage } from "./calculateSpecialHitDamage";
import { finishHit } from "./finishHit";
import type { SpecialHitParams } from "./types";

export function applySpecialHit(params: SpecialHitParams) {
  navigator.vibrate?.(30);

  const {
    damage: trueDmg,
    isCrit,
    type: dmgType,
  } = calculateSpecialHitDamage(params);

  if (isCrit && params.player.character !== "natsuki")
    params.setPlayer((p) => ({ ...p, state: "crit" }));

  if (isCrit && params.player.character === "natsuki") {
    params.onKokusenRef?.current?.();
    params.onBlackFlashRef?.current?.();
    params.onCriticalPushRef?.current?.();
  }

  params.behavior.onSpecialHit({
    damage: trueDmg,
    stacks: params.stacks,
    setNpcHP: params.setNpcHP,
    setStacks: params.setStacks,
    setDelicia: params.setDelicia,
    hitsToSpecial: params.hitsToSpecial,
    char: params.char,
    playerClass: params.playerClass,
    triggerExplosion: params.triggerExplosion,
  });

  finishHit(params, trueDmg, dmgType, 100, "other", params.onSpecialRef);

  return trueDmg;
}
