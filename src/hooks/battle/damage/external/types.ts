import type { DamageArmor } from "@/utils/types/battle/damageKind";
import type { SpawnDamageFn } from "@/utils/types/battle/spawnDamageFn";
import type { BabidiShieldSide } from "@/utils/types/character/babidi";

export type Props = {
  playerX: number;
  playerY: number;
  player: Player;
  totalArmor: DamageArmor;
  blockGauge: number;
  playerShield: number;
  playerHP: number;
  setPlayerHP: React.Dispatch<React.SetStateAction<number>>;
  setPlayerShield: React.Dispatch<React.SetStateAction<number>>;
  setBlockGauge: React.Dispatch<React.SetStateAction<number>>;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  spawnDamageRef: React.RefObject<SpawnDamageFn>;
  onBlockRef?: React.RefObject<(side?: BabidiShieldSide) => void>;
  oneHitShieldRef?: React.RefObject<boolean>;
  lastBlockPressRef: React.RefObject<number>;
  lastAttackPressRef?: React.RefObject<number>;
  onParry?: () => void;
  onDamageTaken?: () => void;
  /** Passiva O Abençoado: se retornar true, o golpe letal reduz a vida a 1. */
  surviveLethalHitRef?: React.RefObject<() => boolean>;
  /** Rede de pesca do babidi: HP da rede (null = inativa). */
  fishingNetHpRef?: React.RefObject<{ hp: number; maxHp: number } | null>;
  /** Callback quando a rede sofre dano. */
  onFishingNetDamage?: (hp: number) => void;
};
