import { useEffect, useMemo } from "react";

import { useSkillGuard } from "@/hooks/battle/player/characters/skillGuard/useSkillGuard";
import { useMenuPause } from "@/hooks/battle/utilities/useMenuPause";
import { usePausableTimers } from "@/hooks/battle/utilities/pausableTimers/usePausableTimers";
import { useExplodingEarrings } from "./useExplodingEarrings";
import { useIceWall } from "./useIceWall";
import { useSmokeBomb } from "./useSmokeBomb";
import { useVampireForm } from "./useVampireForm";
import type {
  LaricellAbilitiesApi,
  LaricellAbilitiesProps,
  LaricellAbilityDeps,
} from "./types";

/**
 * Habilidades ativas da Laricell (issue #517): Parede de Gelo, Brincos
 * Explosivos, Bomba de Fumaça e Forma Vampira (com a Mordida).
 *
 * Um hook de composição porque as cinco dividem a mesma guarda de uso e o
 * mesmo relógio pausável: com o menu aberto a parede, a fumaça e a forma
 * congelam juntas. A Explosão de Stacks e a Expansão de Domínio continuam nos
 * caminhos genéricos (`activeAbilityPress` / `domainBurst`).
 *
 * No unmount os refs que a IA lê (parede e cegueira) são zerados: sem isso a
 * próxima batalha herdaria uma parede invisível.
 */
export function useLaricellAbilities({
  player,
  npc,
  isPausedRef,
  cooldownReduction,
  playSound,
  onUsed,
  freezeActionsUntilRef,
  disabledRef,
  battleEndedRef,
  barrierRef,
  npcBlindRef,
  vampireActive,
  setVampireActive,
  areaHit,
}: LaricellAbilitiesProps): LaricellAbilitiesApi {
  const { isMenuOpen } = useMenuPause();
  const timers = usePausableTimers(isMenuOpen);

  const { usable: guardUsable, usableRef } = useSkillGuard({
    player,
    character: "laricell",
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
  });

  const deps: LaricellAbilityDeps = {
    player,
    npc,
    usableRef,
    isPausedRef,
    cooldownReduction,
    playSound,
    onUsed,
  };

  const { wall, ...iceWall } = useIceWall({ ...deps, barrierRef, timers });
  const { earrings, ...earringsButton } = useExplodingEarrings({
    ...deps,
    timers,
    areaHit,
  });
  const { smokeActive, ...smokeBomb } = useSmokeBomb({
    ...deps,
    npcBlindRef,
    timers,
  });
  const { vampireForm, bite, biteVisual } = useVampireForm({
    ...deps,
    vampireActive,
    setVampireActive,
    timers,
    areaHit,
  });

  useEffect(() => {
    return () => {
      timers.clear();
      barrierRef.current = null;
      npcBlindRef.current = null;
      setVampireActive(false);
    };
  }, [barrierRef, npcBlindRef, setVampireActive, timers]);

  const visual = useMemo(
    () => ({
      wall,
      earrings,
      smokeActive,
      vampireActive,
      bite: biteVisual,
    }),
    [wall, earrings, smokeActive, vampireActive, biteVisual],
  );

  return {
    iceWall: { ...iceWall, usable: guardUsable && iceWall.usable },
    earrings: {
      ...earringsButton,
      usable: guardUsable && earringsButton.usable,
    },
    smokeBomb: { ...smokeBomb, usable: guardUsable && smokeBomb.usable },
    vampireForm: { ...vampireForm, usable: guardUsable && vampireForm.usable },
    bite: { ...bite, usable: guardUsable && bite.usable },
    visual,
  };
}
