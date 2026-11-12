import { useCallback, useState } from "react";
import type { RefObject } from "react";

import { useLaricellCooldown } from "./useLaricellCooldown";
import { LaricellSmokeConstants } from "@/data/characters/laricell/laricell";
import type { PausableTimers } from "@/hooks/battle/utilities/pausableTimers/types";
import type { NpcBlind } from "@/utils/types/battle/npcControl";
import type { LaricellAbilityButton, LaricellAbilityDeps } from "./types";

type Props = LaricellAbilityDeps & {
  npcBlindRef: RefObject<NpcBlind | null>;
  timers: PausableTimers;
};

/**
 * A3 — Bomba de Fumaça. Cega o NPC: a IA (`useNpcAI`) sorteia o erro a cada
 * golpe de alvo único enquanto o ref estiver preenchido.
 *
 * Como na Parede de Gelo, o fim é por timer pausável (`until` infinito), para
 * o menu aberto não consumir a cegueira.
 */
export function useSmokeBomb({
  usableRef,
  isPausedRef,
  cooldownReduction,
  playSound,
  onUsed,
  npcBlindRef,
  timers,
}: Props): LaricellAbilityButton & { smokeActive: boolean } {
  const [smokeActive, setSmokeActive] = useState(false);
  const { arm, isReady, remaining } = useLaricellCooldown({
    isPausedRef,
    cooldownReduction,
  });

  const press = useCallback(() => {
    if (!usableRef.current || !isReady()) return;
    const blind: NpcBlind = {
      until: Number.POSITIVE_INFINITY,
      missChance: LaricellSmokeConstants.MISS_CHANCE,
    };
    npcBlindRef.current = blind;
    setSmokeActive(true);
    playSound("whooshWind");
    onUsed();
    arm(LaricellSmokeConstants.COOLDOWN_MS);
    timers.schedule(() => {
      if (npcBlindRef.current !== blind) return;
      npcBlindRef.current = null;
      setSmokeActive(false);
    }, LaricellSmokeConstants.DURATION_MS);
  }, [arm, isReady, npcBlindRef, onUsed, playSound, timers, usableRef]);

  return { press, usable: remaining <= 0, remaining, smokeActive };
}
