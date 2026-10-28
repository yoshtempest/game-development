import { useCallback } from "react";
import { isPlayerInRange } from "@/gameRules/battle/range";
import { isFacingTarget } from "@/gameRules/battle/direction";
import { YVEL_WEAPON_RANGES } from "@/data/characters/yvel/yvelWeapons";
import type { SummonedNpc } from "@/utils/types/npc/npc";

type Target = { id: string; x: number; y: number };

export function useBuildTargetList(
  player: Player,
  npc: { x: number; y: number },
  npcHP: number,
  summons: SummonedNpc[],
  npcClass: NPCClass,
  weapon?: YvelWeapon,
) {
  const getTargets = useCallback((): Target[] => {
    const targets: Target[] = [];

    if (npcHP > 0) {
      targets.push({ id: "main", x: npc.x, y: npc.y });
    }

    for (const summon of summons) {
      if (summon.hp > 0 && !summon.isDying) {
        targets.push({ id: summon.id, x: summon.x, y: summon.y });
      }
    }

    targets.sort((a, b) => {
      return Math.abs(player.x - a.x) - Math.abs(player.x - b.x);
    });

    return targets;
  }, [player.x, npc.x, npc.y, npcHP, summons]);

  const isInAttackRange = useCallback(
    (target: { x: number; y: number }) =>
      isPlayerInRange(
        player.x,
        player.y,
        target.x,
        target.y,
        player.state,
        player.character,
        false,
        false,
        npcClass,
        player.character === "yvel" && weapon
          ? YVEL_WEAPON_RANGES[weapon]
          : undefined,
      ) &&
      isFacingTarget(
        player.x,
        player.y,
        target.x,
        target.y,
        player.battleDirection,
        npcClass,
      ),
    [
      player.x,
      player.y,
      player.state,
      player.character,
      player.battleDirection,
      npcClass,
      weapon,
    ],
  );

  return { getTargets, isInAttackRange };
}
