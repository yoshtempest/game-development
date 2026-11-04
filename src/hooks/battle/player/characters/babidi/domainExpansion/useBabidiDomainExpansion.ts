import { useCallback, useEffect, useRef, useState } from "react";

import { useLatestRef } from "@/hooks/useLatestRef";
import { useSkillGuard } from "@/hooks/battle/player/characters/skillGuard/useSkillGuard";

export type BabidiDomainExpansionApi = {
  domainExpansionActive: boolean;
  domainExpansionShattering: boolean;
  press: () => void;
  usable: boolean;
};

export type BabidiDomainExpansionProps = {
  player: Player;
  npc: { x: number; y: number };
  freezeActionsUntilRef: React.RefObject<number>;
  disabledRef: React.RefObject<boolean>;
  isPausedRef: React.RefObject<boolean>;
  battleEndedRef: React.RefObject<boolean>;
  startSpecialIntro: (char: string, cb: () => void, ability: string) => void;
  setDelicia: (fn: (d: number) => number) => void;
  charges: number;
  chargesMax: number;
};

export function useBabidiDomainExpansion({
  player,
  freezeActionsUntilRef,
  disabledRef,
  isPausedRef,
  battleEndedRef,
  startSpecialIntro,
  setDelicia,
  charges,
  chargesMax,
}: BabidiDomainExpansionProps): BabidiDomainExpansionApi {
  const [active, setActive] = useState(false);
  const [shattering, setShattering] = useState(false);
  const activeRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const chargesRef = useLatestRef(charges);
  const chargesMaxRef = useLatestRef(chargesMax);
  const setDeliciaRef = useLatestRef(setDelicia);

  const { usableRef } = useSkillGuard({
    player,
    character: "babidi",
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
    extraCanUse: () =>
      chargesRef.current >= chargesMaxRef.current && !activeRef.current,
    extraCancel: () => !activeRef.current,
  });

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    activeRef.current = false;
    setActive(false);
    setShattering(false);
  }, []);

  const press = useCallback(() => {
    if (activeRef.current) return;
    if (!usableRef.current) return;
    if (chargesRef.current < chargesMaxRef.current) return;

    setDeliciaRef.current(() => 0);
    activeRef.current = true;
    setActive(true);
    setShattering(false);

    startSpecialIntro("babidi", () => {
      // playSound("domainExpansion");
    }, "domainExpansion");

    // Duração do domínio: 8s
    timerRef.current = setTimeout(() => {
      setShattering(true);
      setTimeout(() => {
        clear();
      }, 1500);
    }, 8000);
  }, [
    usableRef,
    chargesRef,
    chargesMaxRef,
    setDeliciaRef,
    startSpecialIntro,
    clear,
  ]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    domainExpansionActive: active,
    domainExpansionShattering: shattering,
    press,
    usable: usableRef.current,
  };
}