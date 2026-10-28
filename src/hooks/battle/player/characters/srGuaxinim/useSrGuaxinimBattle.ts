import { useMemo } from "react";
import { playerPath } from "@/utils/paths";
import { useSrGuaxinimOraPunch } from "@/hooks/battle/player/characters/srGuaxinim/useSrGuaxinimOraPunch";
import { useSrGuaxinimKillerQueen } from "@/hooks/battle/player/characters/srGuaxinim/useSrGuaxinimKillerQueen";
import type { PunchHitResult } from "@/utils/types/character/srGuaxinim";
import type { SummonedNpc } from "@/utils/types/npc/npc";
import type { ProjectileStrike } from "@/utils/types/battle/projectileHit";
import type { useBattleRefs } from "@/hooks/battle/utilities/useRefs";

type Props = {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  npc: { x: number; y: number; projectiles: Projectile[] };
  summons: SummonedNpc[];
  onPunchHit: (multiplier: number) => PunchHitResult;
  onAreaDamage: (
    explosions: { x: number; y: number }[],
    allEnemies: { id: string; x: number; y: number }[],
  ) => void;
  /** Aplica o dano da explosão nos projéteis que a Queen transformou em bomba. */
  onBombProjectiles: (strikes: ProjectileStrike[]) => void;
  srGuaxinimOraMultiplierRef: React.RefObject<() => number>;
  refs: ReturnType<typeof useBattleRefs>;
  freezeActionsUntilRef: React.RefObject<number>;
};

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
