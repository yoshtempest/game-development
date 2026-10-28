import { useCallback, useEffect, useRef, useState } from "react";
import {
  DIVERGENT_FIST_SPRITE_COUNT,
  DIVERGENT_FIST_FRAME_MS,
} from "@/gameRules/battle/cursedEnergy";

/**
 * Animação de sobreposição do Punho Divergente do natsuki sobre o inimigo:
 * exibe `one.svg` → `eight.svg`, cada sprite por `DIVERGENT_FIST_FRAME_MS`.
 * O quadro `divergentFistFrame` começa em 0 e avança a cada 50ms; a animação
 * se encerra (volta a `null`) após `DIVERGENT_FIST_SPRITE_COUNT` quadros.
 */
export function useDivergentFistAnimation() {
  const [frame, setFrame] = useState<number | null>(null);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearStep = useCallback(() => {
    if (stepTimerRef.current) {
      clearTimeout(stepTimerRef.current);
      stepTimerRef.current = null;
    }
  }, []);

  const clearDivergentFist = useCallback(() => {
    clearStep();
    setFrame(null);
  }, [clearStep]);

  useEffect(() => clearDivergentFist, [clearDivergentFist]);

  const triggerDivergentFist = useCallback(() => {
    clearStep();
    const step = (i: number) => {
      if (i >= DIVERGENT_FIST_SPRITE_COUNT) {
        setFrame(null);
        return;
      }
      setFrame(i);
      stepTimerRef.current = setTimeout(
        () => step(i + 1),
        DIVERGENT_FIST_FRAME_MS,
      );
    };
    step(0);
  }, [clearStep]);

  return {
    divergentFistFrame: frame,
    triggerDivergentFist,
    clearDivergentFist,
  };
}
