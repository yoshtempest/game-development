import { useCallback, useRef } from "react";

import { nextComboStepIndex } from "@/gameRules/battle/basicCombo";
import {
  BASIC_COMBO_STEPS,
  BASIC_COMBO_WINDOW_MS,
} from "@/data/battle/basicCombo";

/**
 * Estado do combo básico genérico (issue #376). Vive em refs, como o combo do
 * ematron, porque o `attack()` (useMovement) decide o passo e o
 * `handlePlayerHit` (usePlayerActions) aplica o dano no MESMO press, antes de
 * qualquer re-render: o estado do React ainda não refletiria o passo novo.
 *
 * - `stepIndexRef`: passo do último press que iniciou um básico.
 * - `activeRef`: true só quando o press atual iniciou um básico do combo; o
 *   `handlePlayerHit` só aplica multiplicador/crítico/debuff nesse caso, para
 *   presses que não mudaram o estado (mash durante a animação) não herdarem o
 *   golpe pesado.
 */
export function useBasicCombo() {
  const stepIndexRef = useRef(0);
  const lastPressAtRef = useRef(0);
  const activeRef = useRef(false);

  const advance = useCallback((now: number): number => {
    const nextIndex = nextComboStepIndex({
      previousIndex: stepIndexRef.current,
      lastPressAt: lastPressAtRef.current,
      now,
      windowMs: BASIC_COMBO_WINDOW_MS,
      length: BASIC_COMBO_STEPS.length,
    });
    stepIndexRef.current = nextIndex;
    lastPressAtRef.current = now;
    return nextIndex;
  }, []);

  const reset = useCallback(() => {
    stepIndexRef.current = 0;
    lastPressAtRef.current = 0;
    activeRef.current = false;
  }, []);

  return { stepIndexRef, lastPressAtRef, activeRef, advance, reset };
}

export type BasicComboApi = ReturnType<typeof useBasicCombo>;
