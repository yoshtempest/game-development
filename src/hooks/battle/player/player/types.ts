import type { VampirismStats } from "@/gameRules/battle/vampirism/applyVampirism";
import type { CharacterProgress } from "@/data/characters/defaultProgress";
import type { ElementType } from "@/utils/types/battle/element";
import type { OnBeforeNpcHit } from "@/hooks/battle/npc/blocking/useBlocking";
import type { BattleBehavior } from "@/utils/types/player/behavior";
import type {
  DamageArmor,
  DamageKind,
} from "@/utils/types/battle/damageKind";

import type { ProjectileHitDamageFn } from "@/utils/types/battle/projectileHit";

export type Props = {
  player: Player;
  playerClass: PlayerClass;
  char: CharacterProgress;
  behavior: BattleBehavior;

  playerX: number;
  playerY: number;
  npcX: number;
  npcY: number;
  playerState: PlayerState;
  npcClass: NPCClass;
  npcElementTypes: readonly ElementType[];
  weapon?: YvelWeapon;

  HITS_TO_SPECIAL: number;

  setNpcHP: React.Dispatch<React.SetStateAction<number>>;
  setPlayerHP: React.Dispatch<React.SetStateAction<number>>;
  playerHP: number;
  playerMaxHp: number;
  vampirism: VampirismStats;
  totalMaxHpDamage: number;
  totalTrueDamage: number;
  playerCooldown: React.RefObject<boolean>;
  /** Recebe o resolvedor do dano do golpe ativo (lido pelo useProjectile). */
  playerHitDamageRef: React.RefObject<ProjectileHitDamageFn>;
  isEnding: React.RefObject<boolean>;

  spawnPiercing: () => void;
  triggerExplosion: () => void;
  titleDamageBonus: number;
  elementDamageBonus: number;
  critRate: number;
  npcArmor: DamageArmor;
  spawnDamageRef: React.RefObject<
    (value: number, x: number, y: number, type: DamageType) => void
  >;
  timeRef: React.RefObject<TimeEffect[]>;
  registerHitRef: React.RefObject<(damage: number) => void>;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  /** Devolve o multiplicador atual do ataque básico do srGuaxinim (escala ORA). */
  srGuaxinimOraMultiplierRef?: React.RefObject<() => number>;
  /** Devolve o multiplicador atual da Forma Vastolord do marshadow. */
  vastolordMultiplierRef?: React.RefObject<() => number>;
  /** Punho Divergente do natsuki: true quando o próximo ataque dobra o dano. */
  divergentFistRef?: React.RefObject<boolean>;
  /** Dispara quando o Punho Divergente é consumido pelo golpe. */
  onDivergentFistConsumedRef?: React.RefObject<() => void>;
  onBeforeNpcHitRef?: React.RefObject<OnBeforeNpcHit>;
  onDamageDealtRef?: React.RefObject<(amount: number, kind?: DamageKind) => void>;
  onAttackRef?: React.RefObject<() => void>;
  onSpecialRef?: React.RefObject<() => void>;
  onKokusenRef?: React.RefObject<() => void>;
  onBlackFlashRef?: React.RefObject<() => void>;
  onCriticalPushRef?: React.RefObject<() => void>;
  /** Dispara quando o marshadow (forma padrão) acerta um ataque básico no NPC. */
  onMarshadowDefaultHitRef?: React.RefObject<() => void>;
  onHalfHeal?: () => void;
};
