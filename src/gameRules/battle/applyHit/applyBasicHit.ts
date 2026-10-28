import { playAttackSound } from "@/utils/audio/playAttackSound";
import { calculateBasicHitDamage } from "./calculateBasicHitDamage";
import { finishHit } from "./finishHit";
import type { BasicHitParams } from "./types";

export function applyBasicHit(params: BasicHitParams) {
  playAttackSound(params.player.character);
  navigator.vibrate?.(20);

  const {
    damage: trueDmg,
    isCrit,
    type: dmgType,
  } = calculateBasicHitDamage(params);

  if (isCrit && params.player.character !== "natsuki")
    params.setPlayer((p) => ({ ...p, state: "crit" }));

  if (isCrit && params.player.character === "natsuki") {
    params.onKokusenRef?.current?.();
    params.onBlackFlashRef?.current?.();
    params.onCriticalPushRef?.current?.();
  }

  params.behavior.onBasicHit({
    damage: trueDmg,
    setNpcHP: params.setNpcHP,
    char: params.char,
    playerClass: params.playerClass,
    setDelicia: params.setDelicia,
    HITS_TO_SPECIAL: params.HITS_TO_SPECIAL,
    setStacks: params.setStacks,
    spawnPiercing: params.spawnPiercing,
    titleDamageBonus: params.titleDamageBonus,
  });

  finishHit(params, trueDmg, dmgType, 60, "basic", params.onAttackRef);

  return trueDmg;
}
