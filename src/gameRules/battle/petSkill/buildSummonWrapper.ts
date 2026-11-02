import { logPlay } from "@/utils/replay/audioEventLog";
import type { RefObject } from "react";

import { BATTLE_SPAWN } from "@/gameRules/battle/spawnPoints";
import { BATTLE_LIMITS } from "@/gameRules/movement/constants";

export function buildSummonWrapper(params: {
  npcType: string;
  npcPhaseRef: RefObject<number>;
  coffinStartedRef: RefObject<boolean>;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  beginCoffinSequence: (
    spawnPositions: number[],
    groundY: number,
    npcType: string,
    onSpawn: (npcType: string, x: number) => void,
  ) => void;
  player: Player;
  summonNpcRef: RefObject<(npcType: string, overrideX?: number) => void>;
}): (summonType: string) => void {
  return (summonType: string) => {
    if (
      params.npcType === "hungryKing" &&
      params.npcPhaseRef.current === 2 &&
      summonType === "hungryDeath"
    ) {
      if (!params.coffinStartedRef.current) {
        params.coffinStartedRef.current = true;
        params.playSound("summon");
        logPlay("summon");
        // Caixões ao redor do hungryKing (fase 2 o rei fica em BATTLE_SPAWN.npc)
        const kingX = BATTLE_SPAWN.npc.x;
        const positions = [
          Math.max(BATTLE_LIMITS.minX, kingX - 120),
          kingX,
          Math.min(BATTLE_LIMITS.maxX, kingX + 120),
        ];
        params.beginCoffinSequence(
          positions,
          params.player.groundY,
          "hungryDeath",
          (_npcType: string, x: number) =>
            params.summonNpcRef.current("hungryDeath", x),
        );
      }
    } else {
      params.summonNpcRef.current(summonType);
    }
  };
}
