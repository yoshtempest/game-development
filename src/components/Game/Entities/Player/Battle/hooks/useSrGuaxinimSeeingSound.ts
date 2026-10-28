import { useEffect, useRef } from "react";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { playerPathSrGuaxinimHabilities } from "@/utils/paths";

export function useSrGuaxinimSeeingSound(src: string) {
  const { playSound } = useSoundEffects();
  const prePalmPlayedRef = useRef(false);
  const SR_GUAXINIM_SEEING_SRC = playerPathSrGuaxinimHabilities(
    "/bitesTheDust/srGuaxinimSeeing.svg",
  );

  useEffect(() => {
    if (src === SR_GUAXINIM_SEEING_SRC) {
      if (!prePalmPlayedRef.current) {
        playSound("prePalm");
      }

      prePalmPlayedRef.current = true;
    } else {
      prePalmPlayedRef.current = false;
    }
  }, [src, playSound, SR_GUAXINIM_SEEING_SRC]);
}
