import { useCallback, useRef, useState } from "react";

import { NPCS, isNpcType } from "@/data/npc";
import { getNpcStats } from "@/gameRules/npc/npcStats";

type Props = {
  npcLevel: number;
  difficulty: NpcDifficulty;
  playerX: number;
  playerGroundY: number;
};

const ALLY_SPAWN_OFFSET = 200;

export function useAllies({
  npcLevel,
  difficulty,
  playerX,
  playerGroundY,
}: Props) {
  const [allies, setAllies] = useState<SummonedNpc[]>([]);
  const idRef = useRef(0);

  const summonAlly = useCallback(
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

      const spawnX = overrideX ?? playerX + ALLY_SPAWN_OFFSET;
      idRef.current += 1;

      setAllies((prev) => [
        ...prev,
        {
          id: `ally_${Date.now()}_${idRef.current}`,
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

  const clearAllies = useCallback(() => {
    setAllies([]);
    idRef.current = 0;
  }, []);

  return { allies, setAllies, summonAlly, clearAllies };
}
