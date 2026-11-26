import { useEffect } from "react";
import { DOT_TICK_INTERVAL_MS } from "@/gameRules/battle/status/statusEffects";

/**
 * Ticks de DoT no player (sangramento, queimadura, veneno). O dano de cada
 * tick chega pronto em parâmetro porque é fração do dano base do NPC
 * (`getNpcPercentDamage`) e a queimadura ainda passa pela resistência ao
 * calor — o hook só aplica, não decide quanto.
 */
export function useStatusDotTicks(params: {
  isEnding: React.RefObject<boolean>;
  isMenuRef?: React.RefObject<boolean>;
  isPausedRef?: React.RefObject<boolean>;
  setPlayerHP: React.Dispatch<React.SetStateAction<number>>;
  spawnDamageRef: React.RefObject<
    (value: number, x: number, y: number, type: DamageType) => void
  >;
  bleedTickDamage: number;
  burnTickDamage: number;
  poisonTickDamage: number;
  bleedXRef: React.RefObject<number>;
  bleedYRef: React.RefObject<number>;
  bleedUntilRef: React.RefObject<number>;
  burnUntilRef: React.RefObject<number>;
  poisonUntilRef: React.RefObject<number>;
}) {
  const {
    isEnding,
    isMenuRef,
    isPausedRef,
    setPlayerHP,
    spawnDamageRef,
    bleedTickDamage,
    burnTickDamage,
    poisonTickDamage,
    bleedXRef,
    bleedYRef,
    bleedUntilRef,
    burnUntilRef,
    poisonUntilRef,
  } = params;

  useEffect(() => {
    const interval = setInterval(() => {
      if (isEnding.current || isMenuRef?.current || isPausedRef?.current)
        return;
      if (bleedUntilRef.current > Date.now()) {
        setPlayerHP((hp) => Math.max(0, hp - bleedTickDamage));
        spawnDamageRef.current?.(
          bleedTickDamage,
          bleedXRef.current,
          bleedYRef.current,
          "bleed",
        );
      }
      if (burnUntilRef.current > Date.now()) {
        setPlayerHP((hp) => Math.max(0, hp - burnTickDamage));
        spawnDamageRef.current?.(
          burnTickDamage,
          bleedXRef.current,
          bleedYRef.current,
          "burn",
        );
      }
      if (poisonUntilRef.current > Date.now()) {
        setPlayerHP((hp) => Math.max(0, hp - poisonTickDamage));
        spawnDamageRef.current?.(
          poisonTickDamage,
          bleedXRef.current,
          bleedYRef.current,
          "poison",
        );
      }
    }, DOT_TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [
    setPlayerHP,
    isEnding,
    isMenuRef,
    isPausedRef,
    bleedTickDamage,
    burnTickDamage,
    poisonTickDamage,
    bleedXRef,
    bleedYRef,
    bleedUntilRef,
    burnUntilRef,
    poisonUntilRef,
    spawnDamageRef,
  ]);
}
