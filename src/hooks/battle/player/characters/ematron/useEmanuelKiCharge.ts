import { useCallback, useEffect, useRef, type RefObject } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import {
  EMANUEL_KI_CHARGE_PER_TICK,
  EMANUEL_KI_CHARGE_TICK_MS,
} from "@/data/characters/emanuel/emanuel";
import type { BattleManaApi } from "@/contexts/BattleManaContext";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import type { SoundId } from "@/utils/audio/soundId";
import { useSkillGuard } from "@/hooks/battle/player/characters/useSkillGuard";

type Props = {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  battleManaRef: RefObject<BattleManaApi | null>;
  freezeActionsUntilRef: RefObject<number>;
  isPausedRef: RefObject<boolean>;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  /** Chamado quando o press inicia a carga (carga da Expansão de Domínio). */
  onUsed?: () => void;
  /** true quando os controles gerais de batalha estão desabilitados (pause, transição de fase, throw). */
  disabledRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
};

/**
 * Carga de Ki do Emanuel: segurar o botão deixa o personagem parado no sprite
 * `chargingKi.svg` e restaura +1 de Ki a cada 100ms. Enquanto segurado, todas
 * as ações ficam congeladas (freezeActionsUntilRef = Infinity). Ao soltar,
 * volta para idle e o congelamento termina.
 */
export function useEmanuelKiCharge({
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
    character: "emanuel",
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
      battleManaRef.current?.restoreMana(EMANUEL_KI_CHARGE_PER_TICK);
    }, EMANUEL_KI_CHARGE_TICK_MS);
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
