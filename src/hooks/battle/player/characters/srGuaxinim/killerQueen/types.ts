import type { ProjectileStrike } from "@/utils/types/battle/projectileHit";
import type { EnemyTarget } from "@/utils/types/character/srGuaxinim";

export type Props = {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  /** NPC principal + summons: alvos que levam dano de área. */
  enemies: EnemyTarget[];
  /** Projéteis do NPC: congelados e transformados em bomba. */
  projectiles: Projectile[];
  /** Efeitos de time da batalha (regra `gameRules/battle/time`). */
  timeRef: React.RefObject<TimeEffect[]>;
  /** O player não é `TimeKind`: o lock de ação dele é o `freezeActionsUntilRef`. */
  freezePlayerUntilRef: React.RefObject<number>;
  /** Aplica o dano de área da explosão nos projéteis que viraram bomba. */
  onBombProjectiles: (strikes: ProjectileStrike[]) => void;
  onAreaDamage: (
    explosions: { x: number; y: number }[],
    allEnemies: EnemyTarget[],
  ) => void;
};
