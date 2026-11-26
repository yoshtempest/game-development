import { useEffect } from "react";

import { DOT_TICK_INTERVAL_MS } from "@/gameRules/battle/status/statusEffects";

/**
 * Fogo da arena: a cada segundo tira `tickDamage` do jogador enquanto a
 * batalha corre (pausa, menu e fim de batalha suspendem, como os DoTs de
 * status). `tickDamage <= 0` desliga o hook — a maioria das arenas não queima.
 *
 * Não passa pelo funil de armadura de propósito: é dano de ambiente, igual ao
 * tick de `burn`, e a mitigação já vem pronta (resistência a calor) de quem
 * calcula `tickDamage`.
 */
export function useArenaBurnTicks(params: {
  tickDamage: number;
  isEnding: React.RefObject<boolean>;
  isMenuRef?: React.RefObject<boolean>;
  isPausedRef?: React.RefObject<boolean>;
  setPlayerHP: React.Dispatch<React.SetStateAction<number>>;
  spawnDamageRef: React.RefObject<
    (value: number, x: number, y: number, type: DamageType) => void
  >;
  playerXRef: React.RefObject<number>;
  playerYRef: React.RefObject<number>;
}) {
  const {
    tickDamage,
    isEnding,
    isMenuRef,
    isPausedRef,
    setPlayerHP,
    spawnDamageRef,
    playerXRef,
    playerYRef,
  } = params;

  useEffect(() => {
    if (tickDamage <= 0) return;
    const interval = setInterval(() => {
      if (isEnding.current || isMenuRef?.current || isPausedRef?.current)
        return;
      setPlayerHP((hp) => Math.max(0, hp - tickDamage));
      spawnDamageRef.current?.(
        tickDamage,
        playerXRef.current,
        playerYRef.current,
        "burn",
      );
    }, DOT_TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [
    tickDamage,
    isEnding,
    isMenuRef,
    isPausedRef,
    setPlayerHP,
    spawnDamageRef,
    playerXRef,
    playerYRef,
  ]);
}
