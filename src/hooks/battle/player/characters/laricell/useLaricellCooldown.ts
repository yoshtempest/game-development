import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { applyCooldownReduction } from "@/gameRules/battle/cooldownReduction";
import {
  ABILITY_COOLDOWN_TICK_MS,
  useCooldownPauseTick,
} from "@/hooks/battle/utilities/useCooldowns";
import { useLatestRef } from "@/hooks/useLatestRef";

type Options = {
  isPausedRef: RefObject<boolean>;
  cooldownReduction: number;
};

export type LaricellCooldown = {
  /** Deadline em `Date.now()`; `<= agora` = pronta. */
  readyAtRef: RefObject<number>;
  /** Segundos restantes, para o botão. */
  remaining: number;
  /** Arma o cooldown já com a redução de cooldown do personagem aplicada. */
  arm: (baseMs: number) => void;
  isReady: () => boolean;
};

/**
 * Cooldown de uma habilidade da Laricell. As cinco (parede, brincos, fumaça,
 * forma e mordida) contam igual — deadline real que congela com o menu aberto
 * (`useCooldownPauseTick`) e é reduzido pelo stat de redução de cooldown — e
 * repetir isso em cada hook foi exatamente o que fez cooldowns divergirem em
 * outros personagens.
 */
export function useLaricellCooldown({
  isPausedRef,
  cooldownReduction,
}: Options): LaricellCooldown {
  const readyAtRef = useRef(0);
  const [remaining, setRemaining] = useState(0);
  const cooldownReductionRef = useLatestRef(cooldownReduction);
  const cooldownTick = useCooldownPauseTick({ readyAtRef, isPausedRef });

  const arm = useCallback(
    (baseMs: number) => {
      const ms = applyCooldownReduction(baseMs, cooldownReductionRef.current);
      readyAtRef.current = Date.now() + ms;
      setRemaining(ms / 1000);
    },
    [cooldownReductionRef],
  );

  const isReady = useCallback(() => readyAtRef.current <= Date.now(), []);

  useEffect(() => {
    const id = setInterval(() => {
      if (!cooldownTick()) return;
      const next = Math.max(0, (readyAtRef.current - Date.now()) / 1000);
      setRemaining((prev) => (prev === next ? prev : next));
    }, ABILITY_COOLDOWN_TICK_MS);
    return () => clearInterval(id);
  }, [cooldownTick]);

  return { readyAtRef, remaining, arm, isReady };
}
