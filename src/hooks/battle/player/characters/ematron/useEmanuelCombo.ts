import { useCallback, useRef } from "react";

import {
  EMANUEL_COMBO_STEPS,
  EMANUEL_COMBO_WINDOW_MS,
  type EmanuelComboStep,
} from "@/data/characters/emanuel/emanuel";

export function useEmanuelCombo() {
  const stepIndexRef = useRef(0);
  const lastPressAtRef = useRef(0);
  const multiplierRef = useRef(1);
  const airActiveRef = useRef(false);
  const activeRef = useRef(false);
  /** Step aguardando exibição: press durante um golpe do combo em exibição. */
  const queuedStepIndexRef = useRef<number | null>(null);
  /**
   * Chave do sprite em que o último press avançou o combo (punch/hook/lowKick/
   * airKick). Gate de "uma instância de dano por sprite": presses repetidos no
   * mesmo sprite são ignorados até o sprite mudar.
   */
  const lastSpriteKeyRef = useRef<string | null>(null);

  const advance = useCallback((now: number): EmanuelComboStep => {
    const withinWindow =
      now - lastPressAtRef.current <= EMANUEL_COMBO_WINDOW_MS;
    const nextIndex = withinWindow
      ? (stepIndexRef.current + 1) % EMANUEL_COMBO_STEPS.length
      : 0;
    const step = EMANUEL_COMBO_STEPS[nextIndex] ?? EMANUEL_COMBO_STEPS[0];
    stepIndexRef.current = nextIndex;
    multiplierRef.current = step.multiplier;
    lastPressAtRef.current = now;
    return step;
  }, []);

  const reset = useCallback(() => {
    stepIndexRef.current = 0;
    multiplierRef.current = 1;
    lastPressAtRef.current = 0;
    airActiveRef.current = false;
    activeRef.current = false;
    queuedStepIndexRef.current = null;
    lastSpriteKeyRef.current = null;
  }, []);

  return {
    steps: EMANUEL_COMBO_STEPS,
    stepIndexRef,
    lastPressAtRef,
    multiplierRef,
    airActiveRef,
    activeRef,
    queuedStepIndexRef,
    lastSpriteKeyRef,
    advance,
    reset,
  };
}

export type EmanuelComboApi = ReturnType<typeof useEmanuelCombo>;
