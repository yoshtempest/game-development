import { useCallback, useEffect, useRef, useState } from "react";

import { applyHitstop } from "@/gameRules/battle/time";

import {
  DEFAULT_SAMUEL_WEAPON,
  SAMUEL_GRIMOIRE_SUMMON_MS,
  nextSamuelWeapon,
  type SamuelWeapon,
} from "@/data/characters/samurion/grimoire";

type Props = {
  character: CharacterId;
  timeRef: React.RefObject<TimeEffect[]>;
};

/**
 * Grimório de 5 folhas do Samuel (`samurion`): avança a arma na sequência fixa
 * Martelo → Espada → Machado → Martelo.
 *
 * Só cuida do estado da arma e do hitstop da invocação; o custo em stamina é
 * cobrado por quem chama (`useBattleCombat`), no mesmo lugar onde a troca do
 * Yvel cobra mana — assim os dois recursos passam pelo mesmo `consumeMana`.
 * O hitstop reserva a janela da animação de invocação por arma (issue #341),
 * que hoje ainda não tem sprite.
 */
export function useSamuelGrimoire({ character, timeRef }: Props) {
  const [weapon, setWeapon] = useState<SamuelWeapon>(DEFAULT_SAMUEL_WEAPON);
  const summoningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const available = character === "samurion";

  /** true quando a troca aconteceu — o chamador só cobra/recompensa nesse caso. */
  const cycleWeapon = useCallback((): boolean => {
    if (!available || summoningRef.current) return false;

    summoningRef.current = true;
    timeRef.current = applyHitstop(timeRef.current, SAMUEL_GRIMOIRE_SUMMON_MS);
    setWeapon((current) => nextSamuelWeapon(current));

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      summoningRef.current = false;
      timerRef.current = null;
    }, SAMUEL_GRIMOIRE_SUMMON_MS);
    return true;
  }, [available, timeRef]);

  useEffect(() => {
    if (available) setWeapon(DEFAULT_SAMUEL_WEAPON);
  }, [available]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, []);

  return {
    weapon: available ? weapon : undefined,
    cycleWeapon,
  };
}
