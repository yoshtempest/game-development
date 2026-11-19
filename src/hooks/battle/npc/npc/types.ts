import type { PetBlind } from "@/gameRules/battle/petSkill/blind";
import type { DamageArmor } from "@/utils/types/battle/damageKind";
import type { BabidiShieldSide } from "@/utils/types/character/babidi";

import type { VampirismStats } from "@/gameRules/battle/vampirism/applyVampirism";

export type Props = {
  npcLevel: number;
  npcClass: NPCClass;
  playerClass: PlayerClass;
  playerLevel: number;

  playerX: number;
  playerY: number;
  npcX: number;
  npcY: number;

  player: Player;
  totalArmor: DamageArmor;

  damagePlayerHp: (damage: number) => void;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  setNpcHP: React.Dispatch<React.SetStateAction<number>>;
  totalReflect: number;
  /**
   * A reflexão é dano do PRÓPRIO jogador: paga vampirismo universal. O
   * normal não entra, porque não é o ataque básico dele.
   */
  vampirism: VampirismStats;
  playerMaxHp: number;
  setPlayerHP: React.Dispatch<React.SetStateAction<number>>;
  npcCooldown: React.RefObject<boolean>;
  difficulty: NpcDifficulty;
  isEnding: React.RefObject<boolean>;
  spawnDamageRef: React.RefObject<
    (value: number, x: number, y: number, type: DamageType) => void
  >;
  timeRef: React.RefObject<TimeEffect[]>;
  npcStaggerRef: React.RefObject<number>;
  blockGauge: number;
  setBlockGauge: React.Dispatch<React.SetStateAction<number>>;
  lastBlockPressRef: React.RefObject<number>;
  lastAttackPressRef?: React.RefObject<number>;
  onBlockRef?: React.RefObject<(side?: BabidiShieldSide) => void>;
  titleEnemyMissChance?: number;
  onDamageTakenRef?: React.RefObject<(amount: number) => void>;
  onDodgeRef?: React.RefObject<() => void>;
  onHalfHeal?: () => void;
  onParry?: () => void;

  npcType: string;
  npcHp: number;
  npcMaxHp: number;
  npcPhase: number;
  tenacityReduction: number;
  luckBonus: number;
  /**
   * Cegueira do Tornado de Terra (pet Peru) no NPC principal: soma à chance de
   * erro de `npcMeleeHit`/`npcRangedHit` enquanto não vence.
   */
  petBlindRef?: React.RefObject<PetBlind>;
  statMultiplier?: number;
};
