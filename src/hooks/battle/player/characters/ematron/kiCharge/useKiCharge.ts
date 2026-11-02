import type { Props } from "./types";
import { useCallback, useEffect, useRef } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import {
  EMATRON_KI_CHARGE_PER_TICK,
  EMATRON_KI_CHARGE_TICK_MS,
} from "@/data/characters/ematron";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { useSkillGuard } from "@/hooks/battle/player/characters/skillGuard/useSkillGuard";

/**
 * Carga de Ki do Ematron: segurar o botão deixa o personagem parado no sprite
 * `chargingKi.svg` e restaura +1 de Ki a cada 100ms. Enquanto segurado, todas
 * as ações ficam congeladas (freezeActionsUntilRef = Infinity). Ao soltar,
 * volta para idle e o congelamento termina.
 */
export function useEmatronKiCharge({
  player,
  playSound,
  onUsed,
  setPlayer,
  battleManaRef,
  freezeActionsUntilRef,
  isPausedRef,
  disabledRef,
  battleEndedRef,
}: Props) {
  const activeRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onUsedRef = useLatestRef(onUsed);
  const playSoundRef = useLatestRef(playSound);
  const { stopSound } = useSoundEffects();
  const stopSoundRef = useLatestRef(stopSound);

  const setPlayerRef = useLatestRef(setPlayer);

  const { usableRef: canUseRef, shouldCancelRef } = useSkillGuard({
    player,
    character: "ematron",
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
  });

  const release = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    stopSoundRef.current("chargingKi");
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    freezeActionsUntilRef.current = Date.now();
    setPlayerRef.current((p) =>
      p.mode !== "battle" || p.state !== "chargingKi"
        ? p
        : { ...p, state: "idle" },
    );
  }, [freezeActionsUntilRef, setPlayerRef, stopSoundRef]);

  const releaseRef = useLatestRef(release);

  const press = useCallback(() => {
    if (activeRef.current) return;
    if (!canUseRef.current) return;

    onUsedRef.current?.();
    activeRef.current = true;
    freezeActionsUntilRef.current = Infinity;

    setPlayerRef.current((p) =>
      p.mode !== "battle" ? p : { ...p, state: "chargingKi" },
    );
    playSoundRef.current("chargingKi", true);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (shouldCancelRef.current()) {
        releaseRef.current();
        return;
      }
      battleManaRef.current?.restoreMana(EMATRON_KI_CHARGE_PER_TICK);
    }, EMATRON_KI_CHARGE_TICK_MS);
  }, [
    battleManaRef,
    canUseRef,
    freezeActionsUntilRef,
    onUsedRef,
    playSoundRef,
    releaseRef,
    shouldCancelRef,
    setPlayerRef,
  ]);

  useEffect(() => {
    const release = releaseRef.current;
    return () => {
      release();
    };
  }, [releaseRef]);

  return {
    press,
    release,
    canUse: canUseRef.current,
  };
}
