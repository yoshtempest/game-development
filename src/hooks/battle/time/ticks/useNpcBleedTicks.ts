import { useEffect } from "react";
import { DOT_TICK_INTERVAL_MS } from "@/gameRules/battle/status/statusEffects";

export function useNpcBleedTicks(params: {
  isEnding: React.RefObject<boolean>;
  isMenuRef?: React.RefObject<boolean>;
  isPausedRef?: React.RefObject<boolean>;
  setNpcHP: React.Dispatch<React.SetStateAction<number>>;
  spawnDamageRef: React.RefObject<
    (value: number, x: number, y: number, type: DamageType) => void
  >;
  npcBleedXRef: React.RefObject<number>;
  npcBleedYRef: React.RefObject<number>;
  npcBleedUntilRef: React.RefObject<number>;
  /** Dano por tick do sangramento ativo (definido por quem aplicou). */
  npcBleedTickDamageRef: React.RefObject<number>;
}) {
  const {
    isEnding,
    isMenuRef,
    isPausedRef,
    setNpcHP,
    spawnDamageRef,
    npcBleedXRef,
    npcBleedYRef,
    npcBleedUntilRef,
    npcBleedTickDamageRef,
  } = params;

  useEffect(() => {
    const interval = setInterval(() => {
      if (isEnding.current || isMenuRef?.current || isPausedRef?.current)
        return;
      if (npcBleedUntilRef.current > Date.now()) {
        const tick = npcBleedTickDamageRef.current;
        setNpcHP((hp) => Math.max(0, hp - tick));
        spawnDamageRef.current?.(
          tick,
          npcBleedXRef.current,
          npcBleedYRef.current,
          "bleed",
        );
      }
    }, DOT_TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [
    setNpcHP,
    isEnding,
    isMenuRef,
    isPausedRef,
    npcBleedXRef,
    npcBleedYRef,
    npcBleedUntilRef,
    npcBleedTickDamageRef,
    spawnDamageRef,
  ]);
}
