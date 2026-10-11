import { useEffect, useRef, useCallback } from "react";
import type { PetPassiveEffect } from "@/data/characters/pets/petSkills";

type Props = {
  passiveEffect: PetPassiveEffect | null;
  enabled: boolean;
  isPaused: boolean;
};

export function usePetPassive({ passiveEffect, enabled, isPaused }: Props) {
  const oneHitShieldRef = useRef(false);

  useEffect(() => {
    if (!enabled || !passiveEffect || passiveEffect.kind !== "oneHitShield") {
      oneHitShieldRef.current = false;
      return;
    }
    if (isPaused) return;

    const id = setInterval(() => {
      oneHitShieldRef.current = true;
    }, passiveEffect.cooldownMs);

    return () => {
      clearInterval(id);
      oneHitShieldRef.current = false;
    };
  }, [enabled, passiveEffect, isPaused]);

  const reset = useCallback(() => {
    oneHitShieldRef.current = false;
  }, []);

  return { oneHitShieldRef, reset };
}
