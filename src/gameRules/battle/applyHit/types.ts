import type { BattleBehavior } from "@/utils/types/player/behavior";
import type { CharacterProgress } from "@/data/characters/defaultProgress";
import type { ElementType } from "@/utils/types/battle/element";
import type { DamageArmor, DamageKind } from "@/utils/types/battle/damageKind";
import type { TimeEffect } from "@/gameRules/battle/time";
import type { VampirismStats } from "@/gameRules/battle/vampirism/applyVampirism";

export type BaseHitParams = {
  player: Player;
  playerClass: PlayerClass;
  char: CharacterProgress;
  behavior: BattleBehavior;
  titleDamageBonus: number;
  elementDamageBonus: number;
  critRate: number;
  npcArmor: DamageArmor;
  npcElementTypes: readonly ElementType[];
  playerHP: number;
  playerMaxHp: number;
  vampirism: VampirismStats;
  totalMaxHpDamage: number;
  totalTrueDamage: number;
  setNpcHP: React.Dispatch<React.SetStateAction<number>>;
  setPlayerHP: React.Dispatch<React.SetStateAction<number>>;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  spawnDamageRef: React.RefObject<
    (value: number, x: number, y: number, type: DamageType) => void
  >;
  registerHitRef: React.RefObject<(damage: number) => void>;
  timeRef: React.RefObject<TimeEffect[]>;
  onDamageDealtRef?: React.RefObject<(amount: number) => void>;
  onAttackRef?: React.RefObject<() => void>;
  onSpecialRef?: React.RefObject<() => void>;
  onKokusenRef?: React.RefObject<() => void>;
  onBlackFlashRef?: React.RefObject<() => void>;
  onCriticalPushRef?: React.RefObject<() => void>;
};

export type DamageCalcParams = {
  player: Player;
  playerClass: PlayerClass;
  char: CharacterProgress;
  titleDamageBonus: number;
  elementDamageBonus: number;
  critRate: number;
  npcArmor: DamageArmor;
  npcElementTypes: readonly ElementType[];
  playerHP: number;
  playerMaxHp: number;
  totalMaxHpDamage: number;
  totalTrueDamage: number;
  damageMultiplier: number;
  /**
   * Natureza do golpe: decide qual coluna de armadura do NPC ele fura.
   * O ataque básico é sempre físico; o special e as habilidades declaram o
   * seu (ver `CHARACTER_ACTIVE_ABILITIES`).
   */
  damageKind: DamageKind;
};

export type ComputeHitDamageParams = Omit<
  DamageCalcParams,
  "titleDamageBonus" | "playerClass"
> & {
  rawDmg: number;
};

export type BasicHitParams = BaseHitParams & {
  damageMultiplier: number;
  /** O ataque básico do marshadow é físico; o resto do jogo também. */
  damageKind: DamageKind;
  npcX: number;
  npcY: number;
  spawnPiercing: () => void;
  setDelicia: React.Dispatch<React.SetStateAction<number>>;
  setStacks: React.Dispatch<React.SetStateAction<number>>;
  HITS_TO_SPECIAL: number;
};

export type SpecialHitParams = BaseHitParams & {
  damageMultiplier: number;
  damageKind: DamageKind;
  npcX: number;
  npcY: number;
  stacks: number;
  setStacks: React.Dispatch<React.SetStateAction<number>>;
  triggerExplosion: () => void;
  setDelicia: React.Dispatch<React.SetStateAction<number>>;
  hitsToSpecial: number;
};
