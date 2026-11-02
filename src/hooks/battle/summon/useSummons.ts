import { useCallback, useRef, useState } from "react";

import { NPCS, isNpcType } from "@/data/npc";
import { getNpcStats } from "@/gameRules/npc/npcStats";



type Props = {
  npcLevel: number;
  difficulty: NpcDifficulty;
  playerX: number;
  playerGroundY: number;
};

const SPAWN_POSITIONS = [550, 650, 750];

/** Distância (px) entre summons que usam `overrideX` para não sobrepor. */
const OVERRIDE_SPAWN_GAP = 100;

export function useSummons({
  npcLevel,
  difficulty,
  playerX,
  playerGroundY,
}: Props) {
  const [summons, setSummons] = useState<SummonedNpc[]>([]);

  const npcXRef = useRef(900);
  const nextSpawnIndex = useRef(0);

  const updateNpcPosition = useCallback((npcX: number) => {
    npcXRef.current = npcX;
  }, []);

  const summonNpc = useCallback(
    (
      npcType: string,
      overrideX?: number,
      options?: { level?: number; statMultiplier?: number },
    ) => {
      if (!isNpcType(npcType)) return;

      const data = NPCS[npcType];

      const level = options?.level ?? npcLevel;
      const statMultiplier = options?.statMultiplier ?? 1;

      const stats = getNpcStats(
        level,
        data.class,
        difficulty,
        statMultiplier,
        npcType,
      );
      const maxHp = stats.hp;

      const spawnIndex = nextSpawnIndex.current;
      nextSpawnIndex.current += 1;

      const spawnX =
        overrideX !== undefined
          ? overrideX + spawnIndex * OVERRIDE_SPAWN_GAP
          : (SPAWN_POSITIONS[spawnIndex % SPAWN_POSITIONS.length] ??
            npcXRef.current);

      const spawnId = nextSpawnIndex.current;

      setSummons((prev) => [
        ...prev,
        {
          id: `summon_${Date.now()}_${spawnId}`,
          npcType,
          x: spawnX,
          y: playerGroundY,
          direction: spawnX < playerX ? "right" : "left",
          state: "walk",
          hp: maxHp,
          maxHp,
          isDying: false,
          level,
          statMultiplier,
          armor: stats.armor,
        },
      ]);
    },
    [npcLevel, difficulty, playerGroundY, playerX],
  );

  const clearSummons = useCallback(() => {
    setSummons([]);
    nextSpawnIndex.current = 0;
  }, []);

  return {
    summons,
    setSummons,
    summonNpc,
    clearSummons,
    updateNpcPosition,
  };
}
