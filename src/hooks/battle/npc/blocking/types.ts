
import type { SpawnDamageFn } from "@/utils/types/battle/spawnDamageFn";
import type { BabidiShieldSide } from "@/utils/types/character/babidi";

export type HandleBlockingParams = {
  dmg: number;
  isBlocking: boolean;
  blockGauge: number;
  setBlockGauge: React.Dispatch<React.SetStateAction<number>>;
  damagePlayerWithReflect: (damage: number) => void;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  spawnDamageRef: React.RefObject<SpawnDamageFn>;
  playerX: number;
  playerY: number;
  /** X de quem ataca: define o lado em que o shield do babidi surge. */
  attackerX: number;
  timeRef: React.RefObject<TimeEffect[]>;
  npcStaggerRef: React.RefObject<number>;
  npcCooldown: React.RefObject<boolean>;
  lastBlockPressRef: React.RefObject<number>;
  lastAttackPressRef?: React.RefObject<number>;
  onFullBlock?: () => void;
  onBlockRef?: React.RefObject<(side?: BabidiShieldSide) => void>;
  onParry?: () => void;
  onDamageBlocked?: (blockedDamage: number) => void;
};
