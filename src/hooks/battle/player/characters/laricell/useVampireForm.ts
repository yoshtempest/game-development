import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { useLaricellCooldown } from "./useLaricellCooldown";
import {
  LaricellBiteConstants,
  LaricellVampireConstants,
} from "@/data/characters/laricell/laricell";
import { THREE_HUNDRED_MS } from "@/data/ms";
import type { PausableTimers } from "@/hooks/battle/utilities/pausableTimers/types";
import type {
  LaricellAbilitiesProps,
  LaricellAbilityButton,
  LaricellAbilityDeps,
} from "./types";

type Props = LaricellAbilityDeps & {
  vampireActive: boolean;
  setVampireActive: Dispatch<SetStateAction<boolean>>;
  timers: PausableTimers;
  areaHit: LaricellAbilitiesProps["areaHit"];
};

/** Quanto o flash da mordida fica na tela. */
const BITE_VISIBLE_MS = THREE_HUNDRED_MS;

/**
 * A4 — Forma Vampira + Mordida.
 *
 * A forma não cura por conta própria: ela só liga a flag que o
 * `useBattleSystem` soma ao vampirismo universal (o mesmo funil da Forma
 * Vastolord). Assim TODO dano da Laricell cura durante a forma — básico,
 * stacks, brincos, mordida — sem um segundo caminho de cura para manter.
 *
 * A Mordida é a habilidade que substitui A1–A3 enquanto a forma dura; o
 * alcance é medido a partir da Laricell, porque é um golpe corpo a corpo.
 */
export function useVampireForm({
  player,
  usableRef,
  isPausedRef,
  cooldownReduction,
  playSound,
  onUsed,
  vampireActive,
  setVampireActive,
  timers,
  areaHit,
  npc,
}: Props): {
  vampireForm: LaricellAbilityButton;
  bite: LaricellAbilityButton;
  biteVisual: { x: number; y: number } | null;
} {
  const [biteVisual, setBiteVisual] = useState<{ x: number; y: number } | null>(
    null,
  );
  const formCooldown = useLaricellCooldown({ isPausedRef, cooldownReduction });
  const biteCooldown = useLaricellCooldown({ isPausedRef, cooldownReduction });
  const { arm: armForm, isReady: formReady } = formCooldown;
  const { arm: armBite, isReady: biteReady } = biteCooldown;

  const pressForm = useCallback(() => {
    if (!usableRef.current || vampireActive || !formReady()) return;
    setVampireActive(true);
    playSound("impact");
    onUsed();
    armForm(LaricellVampireConstants.COOLDOWN_MS);
    timers.schedule(
      () => setVampireActive(false),
      LaricellVampireConstants.DURATION_MS,
    );
  }, [
    armForm,
    formReady,
    onUsed,
    playSound,
    setVampireActive,
    timers,
    usableRef,
    vampireActive,
  ]);

  const pressBite = useCallback(() => {
    if (!usableRef.current || !vampireActive || !biteReady()) return;
    playSound("bite");
    onUsed();
    armBite(LaricellBiteConstants.COOLDOWN_MS);
    setBiteVisual({ x: npc.x, y: npc.y });
    areaHit(
      "vampireBite",
      player.x,
      npc.y,
      LaricellBiteConstants.RADIUS_PX,
      LaricellBiteConstants.MULTIPLIER,
    );
    timers.schedule(() => setBiteVisual(null), BITE_VISIBLE_MS);
  }, [
    areaHit,
    armBite,
    biteReady,
    npc.x,
    npc.y,
    onUsed,
    player.x,
    playSound,
    timers,
    usableRef,
    vampireActive,
  ]);

  return {
    vampireForm: {
      press: pressForm,
      usable: !vampireActive && formCooldown.remaining <= 0,
      remaining: formCooldown.remaining,
    },
    bite: {
      press: pressBite,
      usable: vampireActive && biteCooldown.remaining <= 0,
      remaining: biteCooldown.remaining,
    },
    biteVisual,
  };
}
