import type { DamageKind } from "@/utils/types/battle/damageKind";
import type { NewPlayerStatus } from "@/gameRules/battle/status/statusEffects";
import type { SpawnDamageFn } from "@/utils/types/battle/spawnDamageFn";
import type { ProjectileHitDamageFn } from "@/utils/types/battle/projectileHit";
import type { BattleObstacle } from "@/utils/types/maps/battle";
import type { NpcTarget } from "@/gameRules/battle/npc/targeting";
import type { NpcHitIntent } from "@/hooks/battle/coop/types";

export type Props = {
  playerX: number;
  playerY: number;
  playerState: PlayerState;
  playerDirection: Direction;
  playerCharacter: string;
  npcClass: NPCClass;
  /** Projétil acertou: o `Projectile.damageType` diz a natureza do dano. */
  onProjectileHit: (damageKind?: DamageKind) => void;
  /** Soco acertou: o segundo argumento diz a natureza do dano. */
  onMeleeHit: (multiplier?: number, damageKind?: DamageKind) => void;
  isPaused?: boolean;
  npcType: string;
  npcPhaseRef: React.RefObject<number>;
  onSummon?: (npcType: string) => void;
  onPullPlayer?: (x: number) => void;
  isAlfa?: boolean;
  onSummonFromRight?: (npcType: string) => void;
  onDragPlayer?: (npcX: number, npcY: number) => void;
  obstacles?: BattleObstacle[];
  timeRef: React.RefObject<TimeEffect[]>;
  npcStaggerRef: React.RefObject<number>;
  rootedUntilRef?: React.RefObject<number>;
  fishingNetRef?: React.RefObject<{
    x: number;
    y: number;
  } | null>;
  honoredFleeRef?: React.RefObject<boolean>;
  npcHpRef?: React.RefObject<number>;
  npcMaxHpRef?: React.RefObject<number>;
  npcBlockedRef?: React.RefObject<boolean>;
  onGrabPlayer?: (flipped: boolean) => void;
  onThrowStart?: (npcX: number, npcDirection: "left" | "right") => void;
  onThrowPlayer?: (damageMultiplier: number) => void;
  onPushPlayer?: (npcX: number) => void;
  onRamPushPlayer?: (direction: "left" | "right", toX: number) => void;
  lastBlockPressRef?: React.RefObject<number>;
  lastAttackPressRef?: React.RefObject<number>;
  onGroundPaperHit?: () => void;
  onPaperExplode?: () => void;
  onArmorBuff?: (x: number, y: number) => void;
  onLaserHit?: (npcX?: number) => void;
  onProjectileMiss?: (x: number) => void;
  onStuckPaperExplode?: () => void;
  onApplyDebuff?: (status: NewPlayerStatus) => void;
  /** Dano absoluto pelo funil `npcFixedHit` (ver `BehaviorContext.onFixedHit`). */
  onFixedHit?: (amount: number) => void;
  /** Derrota roteirizada: dano igual à vida máxima, sem bloqueio nem parry. */
  onExecutePlayer?: () => void;
  /** Hit da burst do hungryKing (fase 2): 10% do dano base + push de 50px. */
  onBurstHit?: (pushDir: number) => void;
  /** Esfera do Natsuki no estado atual (para colisão com projéteis inimigos). */
  playerProjectileRef?: React.RefObject<PlayerSpecialProjectile | null>;
  /** Vida dos projéteis destrutíveis, indexada pela natureza do seu dano. */
  projectileHpRef?: React.RefObject<Record<DamageKind, number>>;
  /** Damage numbers do jogador acertando projéteis inimigos. */
  spawnDamageRef?: React.RefObject<SpawnDamageFn>;
  /** Token de 1 instância de dano por golpe — projéteis só levam 1 por ataque. */
  playerCooldownRef?: React.RefObject<boolean>;
  /** Dano real do golpe ativo (básico ou special) aplicado nos projéteis. */
  playerHitDamageRef?: React.RefObject<ProjectileHitDamageFn>;
  /** Timestamp até onde os projéteis ficam congelados (Killer Queen). */
  /**
   * Jogadores vivos na arena (co-op). Sem isso a IA cai no jogador local.
   * A escolha é sempre de **um** alvo; golpes de área são roteados à parte.
   */
  targets?: NpcTarget[];
  /** HP local > 0; o alvo local do co-op é descartado quando o jogador cai. */
  localAliveRef?: React.RefObject<boolean>;
  /** Guest do co-op não roda IA: o NPC é espelhado do snapshot do líder. */
  npcAuthority?: boolean;
  /** Golpe do NPC decidido pelo líder que deve ser resolvido no cliente remoto. */
  onRemoteHit?: (hit: NpcHitIntent) => void;
};
