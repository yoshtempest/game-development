import type { ProjectileStrike } from "@/utils/types/battle/projectileHit";
import type { EnemyTarget } from "@/utils/types/character/srGuaxinim";

export type Props = {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  /** NPC principal + summons: alvos que levam dano de área. */
  enemies: EnemyTarget[];
  /** Projéteis do NPC: transformados em bomba (seguem andando até a detonação). */
  projectiles: Projectile[];
  /** Aplica o dano de área da explosão nos projéteis que viraram bomba. */
  onBombProjectiles: (strikes: ProjectileStrike[]) => void;
  onAreaDamage: (
    explosions: { x: number; y: number }[],
    allEnemies: EnemyTarget[],
  ) => void;
};
