import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_YVEL_WEAPON,
  rollNextYvelWeapon,
  type YvelWeapon,
} from "@/data/characters/yvel/yvelWeapons";
import { applyHitstop, type TimeEffect } from "@/gameRules/battle/time";

export const YVEL_WEAPON_SWITCH_DURATION_MS = 600;

type Props = {
  character: CharacterId;
  isEndingRef?: React.RefObject<boolean>;
  timeRef: React.RefObject<TimeEffect[]>;
};

/**
 * Mecânica única do Yvel (Yvel): botão extra que congela a batalha por um
 * instante e troca aleatoriamente para outra arma (nunca a atual, e nunca
 * withBow/arms/withNothing). A troca altera as sprites do personagem.
 */
export function useYvelWeaponSwitch({
  character,
  isEndingRef,
  timeRef,
}: Props) {
  const [weapon, setWeapon] = useState<YvelWeapon>(DEFAULT_YVEL_WEAPON);
  const switchingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const available = character === "yvel";

  /** true quando a troca realmente aconteceu (o chamador decide recompensa). */
  const switchWeapon = useCallback((): boolean => {
    if (!available) return false;
    if (isEndingRef?.current) return false;
    if (switchingRef.current) return false;

    switchingRef.current = true;
    timeRef.current = applyHitstop(
      timeRef.current,
      YVEL_WEAPON_SWITCH_DURATION_MS,
    );

    const next = rollNextYvelWeapon(weapon);
    setWeapon(next);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      switchingRef.current = false;
      timerRef.current = null;
    }, YVEL_WEAPON_SWITCH_DURATION_MS);
    return true;
  }, [available, isEndingRef, timeRef, weapon]);

  useEffect(() => {
    if (available) {
      setWeapon(DEFAULT_YVEL_WEAPON);
    }
  }, [available]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, []);

  return {
    weapon: available ? weapon : undefined,
    switching: switchingRef.current,
    switchWeapon,
  };
}
