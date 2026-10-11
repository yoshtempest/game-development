import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_LUCAS_WEAPON,
  rollNextLucasWeapon,
  type LucasWeapon,
} from "@/data/characters/lucas/lucasWeapons";
import { applyHitstop, type TimeEffect } from "@/gameRules/battle/time";

export const LUCAS_WEAPON_SWITCH_DURATION_MS = 600;

type Props = {
  character: CharacterId;
  isEndingRef?: React.RefObject<boolean>;
  timeRef: React.RefObject<TimeEffect[]>;
};

/**
 * Mecânica única do Lucas (Yvel): botão extra que congela a batalha por um
 * instante e troca aleatoriamente para outra arma (nunca a atual, e nunca
 * withBow/arms/withNothing). A troca altera as sprites do personagem.
 */
export function useLucasWeaponSwitch({
  character,
  isEndingRef,
  timeRef,
}: Props) {
  const [weapon, setWeapon] = useState<LucasWeapon>(DEFAULT_LUCAS_WEAPON);
  const switchingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const available = character === "lucas";

  /** true quando a troca realmente aconteceu (o chamador decide recompensa). */
  const switchWeapon = useCallback((): boolean => {
    if (!available) return false;
    if (isEndingRef?.current) return false;
    if (switchingRef.current) return false;

    switchingRef.current = true;
    timeRef.current = applyHitstop(
      timeRef.current,
      LUCAS_WEAPON_SWITCH_DURATION_MS,
    );

    const next = rollNextLucasWeapon(weapon);
    setWeapon(next);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      switchingRef.current = false;
      timerRef.current = null;
    }, LUCAS_WEAPON_SWITCH_DURATION_MS);
    return true;
  }, [available, isEndingRef, timeRef, weapon]);

  useEffect(() => {
    if (available) {
      setWeapon(DEFAULT_LUCAS_WEAPON);
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
