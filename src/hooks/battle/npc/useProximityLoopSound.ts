import { useRef, useCallback } from "react";

import { logPlay, logStop } from "@/utils/replay/audioEventLog";

export function useProximityLoopSound(
  npcTypeRef: React.RefObject<string>,
  playerXRef: React.RefObject<number>,
  playerYRef: React.RefObject<number>,
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void,
  stopSound: (sound: SoundId) => void,
) {
  const playingRef = useRef(false);

  const update = useCallback(
    (npcX: number, npcY: number) => {
      if (npcTypeRef.current !== "jhowsimar") return;
      const inRange =
        Math.abs(npcX - playerXRef.current) <= 50 &&
        Math.abs(playerYRef.current - npcY) <= 150;
      if (!inRange && !playingRef.current) {
        playingRef.current = true;
        playSound("jhowsimarVemCa", true);
        logPlay("jhowsimarVemCa", true);
      } else if (inRange && playingRef.current) {
        playingRef.current = false;
        stopSound("jhowsimarVemCa");
        logStop("jhowsimarVemCa");
      }
    },
    [npcTypeRef, playerXRef, playerYRef, playSound, stopSound],
  );

  return { update };
}
