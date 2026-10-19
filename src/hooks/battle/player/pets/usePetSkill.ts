import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import {
  ABILITY_COOLDOWN_TICK_MS,
  useCooldownPauseTick,
} from "@/hooks/battle/utilities/useCooldowns";

type Props = {
  enabled: boolean;
  cooldownMs: number;
  isPaused: boolean;
  /**
   * Pausa global da batalha (menu de batalha aberto, intro, vitória...):
   * congela o cooldown — a batalha pausada não regenera habilidade.
   */
  isPausedRef?: RefObject<boolean>;
  onTrigger: () => void;
};

export function usePetSkillCooldown({
  enabled,
  cooldownMs,
  isPaused,
  isPausedRef,
  onTrigger,
}: Props) {
  const [remaining, setRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const readyAtRef = useRef(0);
  const cooldownMsRef = useLatestRef(cooldownMs);
  const onTriggerRef = useLatestRef(onTrigger);

  useEffect(() => {
    if (!enabled) {
      readyAtRef.current = 0;
      setRemaining(0);
      setIsActive(false);
    }
  }, [enabled]);

  const cooldownTick = useCooldownPauseTick({ readyAtRef, isPausedRef });

  useEffect(() => {
    if (!isActive || isPaused) return;

    const id = setInterval(() => {
      if (!cooldownTick()) return;
      const left = Math.max(0, (readyAtRef.current - Date.now()) / 1000);
      setRemaining(left);
      if (left <= 0) setIsActive(false);
    }, ABILITY_COOLDOWN_TICK_MS);

    return () => clearInterval(id);
  }, [cooldownTick, isActive, isPaused]);

  const trigger = useCallback(() => {
    if (!enabled || Date.now() < readyAtRef.current) return;
    readyAtRef.current = Date.now() + cooldownMsRef.current;
    setRemaining(cooldownMsRef.current / 1000);
    setIsActive(true);
    onTriggerRef.current();
  }, [enabled, cooldownMsRef, onTriggerRef]);

  const reset = useCallback(() => {
    readyAtRef.current = 0;
    setRemaining(0);
    setIsActive(false);
  }, []);

  return {
    remaining,
    ready: enabled && !isActive,
    trigger,
    reset,
  };
}
