import type { PunchHitResult } from "@/utils/types/character/srGuaxinim";
import type { ProjectileStrike } from "@/utils/types/battle/projectileHit";
import type { useBattleRefs } from "@/hooks/battle/utilities/useRefs";

export type Props = {
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
