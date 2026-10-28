import { useCallback, useRef } from "react";

import {
  EMATRON_COMBO_STEPS,
  EMATRON_COMBO_WINDOW_MS,
  type EmatronComboStep,
} from "@/data/characters/ematron";

export function useEmatronCombo() {
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

  const advance = useCallback((now: number): EmatronComboStep => {
    const withinWindow =
      now - lastPressAtRef.current <= EMATRON_COMBO_WINDOW_MS;
    const nextIndex = withinWindow
      ? (stepIndexRef.current + 1) % EMATRON_COMBO_STEPS.length
      : 0;
    const step = EMATRON_COMBO_STEPS[nextIndex] ?? EMATRON_COMBO_STEPS[0];
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
    steps: EMATRON_COMBO_STEPS,
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

export type EmatronComboApi = ReturnType<typeof useEmatronCombo>;
