import type { Dispatch, RefObject, SetStateAction } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useBattleNavbar } from "@/contexts/BattleNavbarContext";

import { useLatestRef } from "@/hooks/useLatestRef";
import { useSkillGuard } from "@/hooks/battle/player/characters/skillGuard/useSkillGuard";
import { usePausableTimers } from "@/hooks/battle/utilities/pausableTimers/usePausableTimers";
import { DOMAIN_BURST_MS } from "@/hooks/battle/utilities/domainExpansionBurst/useDomainExpansionBurst";

import {
  UNLIMITED_BLADE_WORKS_DURATION_MS,
  type YvelWeapon,
} from "@/data/characters/yvel/yvelWeapons";

type Props = {
  player: Player;
  /** Carga atual/máxima da barra da Expansão (o uso consome tudo). */
  charges: number;
  chargesMax: number;
  setDelicia: Dispatch<SetStateAction<number>>;
  freezeActionsUntilRef: RefObject<number>;
  isPausedRef: RefObject<boolean>;
  /**
   * Pausa dirigida pelo jogador — inclui o próprio arsenal aberto, então a
   * janela do domínio não corre enquanto o jogador escolhe.
   */
  isMenuOpen: boolean;
  battleEndedRef: RefObject<boolean>;
  disabledRef: RefObject<boolean>;
  /** Equipa a arma escolhida (vem do `useYvelWeaponSwitch`). */
  equipWeapon: (weapon: YvelWeapon) => boolean;
};

export type UnlimitedBladeWorksApi = {
  /** Janela do domínio aberta: o botão de troca vira seletor. */
  active: boolean;
  /** Flash do nome do domínio (reusa o `DomainBurstOverlay`). */
  introActive: boolean;
  /** Arsenal aberto — a batalha está pausada. */
  selectorOpen: boolean;
  press: () => void;
  usable: boolean;
  /** Abre o arsenal; false fora da janela do domínio. */
  openSelector: () => boolean;
  selectWeapon: (weapon: YvelWeapon) => void;
  closeSelector: () => void;
};

/**
 * Expansão de Domínio do yvel (`kind: "unlimitedBladeWorks"`, issue #219).
 *
 * Consome as 40 cargas e abre uma janela de
 * `UNLIMITED_BLADE_WORKS_DURATION_MS` em que a troca de arma deixa de ser
 * sorteio pago em mana e vira escolha livre: qualquer arma, a qualquer
 * momento. O arsenal pausa a batalha enquanto está aberto via
 * `openSelectorPause` — o mesmo congelamento do menu — para a escolha não
 * custar tempo de luta. O uso abre o arsenal na hora, porque escolher a
 * primeira arma é o motivo de ativar o domínio.
 *
 * Os timers são `usePausableTimers(isMenuOpen)`: como o arsenal aberto conta
 * como menu, a janela só corre com a batalha rodando.
 */
export function useUnlimitedBladeWorks({
  player,
  charges,
  chargesMax,
  setDelicia,
  freezeActionsUntilRef,
  isPausedRef,
  isMenuOpen,
  battleEndedRef,
  disabledRef,
  equipWeapon,
}: Props): UnlimitedBladeWorksApi {
  const [active, setActive] = useState(false);
  const [introActive, setIntroActive] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);

  const activeRef = useRef(false);
  const selectorOpenRef = useRef(false);

  const { openSelectorPause, closeSelectorPause } = useBattleNavbar();
  const timers = usePausableTimers(isMenuOpen);

  const chargesRef = useLatestRef(charges);
  const chargesMaxRef = useLatestRef(chargesMax);
  const setDeliciaRef = useLatestRef(setDelicia);
  const equipWeaponRef = useLatestRef(equipWeapon);

  const { usable, usableRef } = useSkillGuard({
    player,
    character: "yvel",
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
    extraCanUse: () =>
      chargesRef.current >= chargesMaxRef.current && !activeRef.current,
  });

  const closeSelector = useCallback(() => {
    if (!selectorOpenRef.current) return;
    selectorOpenRef.current = false;
    setSelectorOpen(false);
    closeSelectorPause();
  }, [closeSelectorPause]);

  const openSelector = useCallback((): boolean => {
    if (!activeRef.current) return false;
    if (selectorOpenRef.current) return true;
    if (battleEndedRef.current) return false;
    selectorOpenRef.current = true;
    setSelectorOpen(true);
    openSelectorPause();
    return true;
  }, [battleEndedRef, openSelectorPause]);

  const selectWeapon = useCallback(
    (weapon: YvelWeapon) => {
      if (!selectorOpenRef.current) return;
      equipWeaponRef.current(weapon);
      closeSelector();
    },
    [closeSelector, equipWeaponRef],
  );

  const press = useCallback(() => {
    if (activeRef.current) return;
    if (!usableRef.current) return;

    activeRef.current = true;
    setDeliciaRef.current(0);
    setActive(true);
    setIntroActive(true);

    timers.clear();
    timers.schedule(() => setIntroActive(false), DOMAIN_BURST_MS);
    timers.schedule(() => {
      activeRef.current = false;
      setActive(false);
    }, UNLIMITED_BLADE_WORKS_DURATION_MS);

    openSelector();
  }, [openSelector, setDeliciaRef, timers, usableRef]);

  /**
   * Desmontagem com o arsenal aberto (saída da batalha, troca de rota): fecha
   * a pausa de seletor, senão o player ficaria preso no modo "menu" e o
   * `useMenuPause` continuaria congelando a próxima batalha.
   */
  useEffect(() => {
    return () => {
      timers.clear();
      activeRef.current = false;
      if (selectorOpenRef.current) {
        selectorOpenRef.current = false;
        closeSelectorPause();
      }
    };
  }, [closeSelectorPause, timers]);

  return {
    active,
    introActive,
    selectorOpen,
    press,
    usable,
    openSelector,
    selectWeapon,
    closeSelector,
  };
}
