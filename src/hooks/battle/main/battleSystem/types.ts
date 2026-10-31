import type { TimeEffect } from "@/gameRules/battle/time";
import type { ProjectileHitDamageFn } from "@/utils/types/battle/projectileHit";
import type { BabidiShieldSide } from "@/utils/types/character/babidi";
import type { OnBeforeNpcHit } from "@/hooks/battle/npc/useBlocking";

export type BattleSystemProps = {
  playerX: number;
  playerY: number;
  npcX: number;
  npcY: number;
  npcLevel: number;
  npcClass:
    "common" | "rare" | "epic" | "boss" | "legendary" | "supreme" | "omega";
  npcType: string;
  onPlayerDeath: () => void;
  onNpcDeath: () => void;
  playerState: PlayerState;
  difficulty: NpcDifficulty;
  timeRef: React.RefObject<TimeEffect[]>;
  npcStaggerRef: React.RefObject<number>;
  /** Token de 1 instância de dano por golpe (criado no useBattleRefs). */
  playerCooldown: React.RefObject<boolean>;
  /** Dano do golpe ativo para projéteis inimigos (criado no useBattleRefs). */
  playerHitDamageRef: React.RefObject<ProjectileHitDamageFn>;
  registerHitRef: React.RefObject<(damage: number) => void>;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  lastBlockPressRef: React.RefObject<number>;
  lastAttackPressRef?: React.RefObject<number>;
  npcPhaseRef: React.RefObject<number>;
  onBeforeNpcHitRef?: React.RefObject<OnBeforeNpcHit>;
  onBlockRef?: React.RefObject<(side?: BabidiShieldSide) => void>;
  onDamageTakenRef?: React.RefObject<(amount: number) => void>;
  onDodgeRef?: React.RefObject<() => void>;
  onDamageDealtRef?: React.RefObject<(amount: number) => void>;
  onAttackRef?: React.RefObject<() => void>;
  onSpecialRef?: React.RefObject<() => void>;
  onKokusenRef?: React.RefObject<() => void>;
  onBlackFlashRef?: React.RefObject<() => void>;
  onCriticalPushRef?: React.RefObject<() => void>;
  srGuaxinimOraMultiplierRef?: React.RefObject<() => number>;
  /** Aplica o multiplicador da Forma Vastolord no dano do marshadow. */
  vastolordMultiplierRef?: React.RefObject<() => number>;
  /** Forma Vastolord ativa: multiplica a armadura do marshadow por 4. */
  vastolordActive?: boolean;
  /** Punho Divergente: true quando ativado, consome no próximo golpe básico. */
  divergentFistRef?: React.RefObject<boolean>;
  onDivergentFistConsumedRef?: React.RefObject<() => void>;
  petId?: string | null;
  onPetSkillRef?: React.RefObject<() => void>;
  isMenuRef?: React.RefObject<boolean>;
  /** Pausa global (menu/intro/victory/passiva O Abençoado): pausa os ticks de dano. */
  isPausedRef?: React.RefObject<boolean>;
  savedPlayerHP?: number | null;
  npcStatMultiplier?: number;
  npcArmorBonus?: number;
  weapon?: YvelWeapon;
  /** Passiva O Abençoado: quando retorna true, o golpe letal reduz a vida a 1. */
  surviveLethalHitRef?: React.RefObject<() => boolean>;
  fishingNetHpRef?: React.RefObject<{ hp: number; maxHp: number } | null>;
  onFishingNetDamage?: (hp: number) => void;
};