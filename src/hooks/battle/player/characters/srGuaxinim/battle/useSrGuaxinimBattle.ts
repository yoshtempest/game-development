import type { Props } from "./types";
import { useMemo } from "react";
import { playerPath } from "@/utils/paths";
import { useSrGuaxinimOraPunch } from "@/hooks/battle/player/characters/srGuaxinim/oraPunch/useOraPunch";
import { useSrGuaxinimKillerQueen } from "@/hooks/battle/player/characters/srGuaxinim/killerQueen/useKillerQueen";


export function useSrGuaxinimBattle({
  player,
  setPlayer,
  npc,
  summons,
  onPunchHit,
  onAreaDamage,
  onBombProjectiles,
  srGuaxinimOraMultiplierRef,
  refs,
  freezeActionsUntilRef,
}: Props) {
  const enemies = useMemo(() => {
    if (player.character !== "srGuaxinim") return [];
    return [
      { id: "main", x: npc.x, y: npc.y },
      ...summons
        .filter((s) => !s.isDying && s.hp > 0)
        .map((s) => ({ id: s.id, x: s.x, y: s.y })),
    ];
  }, [player.character, npc.x, npc.y, summons]);

  const {
    oraPress,
    oraRelease,
    punches: extraPunches,
  } = useSrGuaxinimOraPunch({
    player,
    setPlayer,
    onPunchHit,
    multiplierRef: srGuaxinimOraMultiplierRef,
  });

  const extraPunchSprite = playerPath(
    "/srGuaxinim/inFight/attacks/extraPunch.svg",
  );

  const {
    killerQueen,
    bombTargets,
    killerQueenSprite,
    bombSprite,
    explosionSprite,
  } = useSrGuaxinimKillerQueen({
    player,
    setPlayer,
    enemies,
    projectiles: npc.projectiles,
    timeRef: refs.timeRef,
    freezePlayerUntilRef: freezeActionsUntilRef,
    onBombProjectiles,
    onAreaDamage,
  });

  return {
    oraPress,
    oraRelease,
    extraPunches,
    extraPunchSprite,
    killerQueen,
    bombTargets,
    killerQueenSprite,
    bombSprite,
    explosionSprite,
  };
}
