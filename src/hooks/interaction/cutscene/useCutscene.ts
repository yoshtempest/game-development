import type { Props } from "./types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGameControls } from "@/contexts/GameControlsContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useDialogue } from "@/hooks/interaction/useDialogue";
import { usePlayer } from "@/contexts/PlayerContext";
import { THREE_THOUSAND_MS } from "@/data/ms";

/** Tempo de `L` pressionado que abre o prompt de pular a cutscene. */
export const CUTSCENE_SKIP_HOLD_MS = THREE_THOUSAND_MS;

export function useCutscene({
  dialogue,
  autoStart = true,
  playOnce = true,
  onFinish,
  playAudio,
  onBeforeNext,
}: Props) {
  const { player } = usePlayer();
  const dialogueSystem = useDialogue(dialogue, onFinish);
  const { pushControls } = useGameControls();

  const hasPlayed = useRef(false);

  const [isSkipPromptOpen, setIsSkipPromptOpen] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoldTimer = useCallback(() => {
    if (!holdTimerRef.current) return;
    clearTimeout(holdTimerRef.current);
    holdTimerRef.current = null;
  }, []);

  useEffect(() => clearHoldTimer, [clearHoldTimer]);

  const dialogueSystemRef = useLatestRef(dialogueSystem);
  const playAudioRef = useLatestRef(playAudio);

  // ▶ iniciar automaticamente
  useEffect(() => {
    if (!autoStart) return;

    if (playOnce && hasPlayed.current) return;

    dialogueSystemRef.current.start();
    if (!dialogueSystemRef.current.nextSoundSrc) {
      playAudioRef.current?.();
    }
    hasPlayed.current = true;
  }, [autoStart, playOnce, dialogueSystemRef, playAudioRef]);

  // ▶ handler estável
  const handleConfirmRef = useRef<() => void>(() => {});

  handleConfirmRef.current = () => {
    if (!dialogueSystem.isOpen) return;

    if (player.mode === "ui") return;

    const shouldContinue = onBeforeNext?.(dialogueSystem.dialogue!);

    if (shouldContinue === false) return;

    dialogueSystemRef.current.next();
    if (!dialogueSystemRef.current.nextSoundSrc) {
      playAudioRef.current?.();
    }
  };

  const dialogueSkipRef = useLatestRef(dialogueSystem.skip);

  /**
   * Confirma o pulo: corta o diálogo restante e dispara o término da
   * cutscene, o mesmo caminho de quem assistiu até a última fala.
   */
  const confirmSkip = useCallback(() => {
    setIsSkipPromptOpen(false);
    clearHoldTimer();
    dialogueSkipRef.current();
  }, [clearHoldTimer, dialogueSkipRef]);

  const cancelSkip = useCallback(() => {
    setIsSkipPromptOpen(false);
  }, []);

  /** Abre o prompt de confirmação de pulo (usado pelo botão de pular). */
  const openSkipPrompt = useCallback(() => {
    clearHoldTimer();
    setIsSkipPromptOpen(true);
  }, [clearHoldTimer]);

  const pushControlsRef = useLatestRef(pushControls);

  // 🔥 CORREÇÃO AQUI
  useEffect(() => {
    if (!dialogueSystem.isOpen) return;

    if (player.mode === "ui") return;

    const remove = pushControlsRef.current({
      onConfirm: () => {
        handleConfirmRef.current();
        clearHoldTimer();
        holdTimerRef.current = setTimeout(() => {
          holdTimerRef.current = null;
          setIsSkipPromptOpen(true);
        }, CUTSCENE_SKIP_HOLD_MS);
      },
      onConfirmRelease: () => clearHoldTimer(),
    });

    return () => {
      clearHoldTimer();
      remove();
    };
  }, [dialogueSystem.isOpen, player.mode, pushControlsRef, clearHoldTimer]);

  return {
    ...dialogueSystem,
    hasPlayed: hasPlayed.current,
    isSkipPromptOpen,
    confirmSkip,
    cancelSkip,
    openSkipPrompt,
  };
}
