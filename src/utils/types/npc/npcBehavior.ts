import type { NPCBattleState } from "@/utils/types/npc/npc";
import type { SoundId } from "@/utils/audio/soundId";
import type { NewPlayerStatus } from "@/gameRules/battle/status/statusEffects";
import type { DamageKind } from "@/utils/types/battle/damageKind";

export type BehaviorContext = {
  npc: NPCBattleState;
  playerX: number;
  playerY: number;
  playerState: PlayerState;
  playerDirection: Direction;
  targetX: number;
  targetY: number;
  projectile: Projectile | null;
  setProjectile: (p: Projectile | null) => void;
  lastAttackRef: { current: number };
  /**
   * Golpe corpo a corpo. O segundo argumento é a natureza do dano e decide
   * qual coluna de armadura do player ele fura — ausente = físico. Um NPC
   * que só ataca de longe passa a natureza pelo `onProjectileHit`/`Projectile`
   * em vez deste.
   */
  onMeleeHit: (multiplier?: number, damageKind?: DamageKind) => void;
  /** Projétil que acertou: o `Projectile.damageType` diz a natureza do dano. */
  onProjectileHit: () => void;
  setForceIdle: (v: boolean) => void;
  npcPhase: number;
  onSummon?: (npcType: string) => void;
  onPullPlayer?: (x: number) => void;
  summonTimerRef?: { current: number };
  playSound?: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  npcHp?: number;
  npcMaxHp?: number;
  onGrabPlayer?: (flipped: boolean) => void;
  onThrowStart?: (npcX: number, npcDirection: "left" | "right") => void;
  onThrowPlayer?: (damageMultiplier: number) => void;
  onPushPlayer?: (npcX: number) => void;
  /** Empurra o jogador para `toX` (sem tween) na direção informada. */
  onRamPushPlayer?: (direction: "left" | "right", toX: number) => void;
  /** true quando o jogador tocou block/attack nos últimos 0-50ms (janela de parry). */
  isPlayerParrying?: () => boolean;
  onGroundPaperHit?: () => void;
  onPaperExplode?: () => void;
  onArmorBuff?: (x: number, y: number) => void;
  /** Dano (e empurrão, quando aplicável) do laser do NPC. `npcX` é a
   *  posição do NPC gerador, para empurrar o jogador na direção oposta. */
  onLaserHit?: (npcX?: number) => void;
  onStuckPaperExplode?: () => void;
  onApplyDebuff?: (status: NewPlayerStatus) => void;
  /** true quando o NPC da batalha é um alfa (sprites de alfa, special etc). */
  isAlfa?: boolean;
  /** Spawna um aliado surgindo da direita, fora da vista (entry correndo). */
  onSummonFromRight?: (npcType: string) => void;
  /** Inicia o arrasto do jogador (x e y) junto ao NPC após o pulo do alfa. */
  onDragPlayer?: (npcX: number, npcY: number) => void;
};

export type BehaviorResult = {
  x: number;
  y?: number;
  state?: NPCBattleState["state"];
  /** Quando presente, sobrepõe/limpa a flag `hidden` do NPC. */
  hidden?: boolean;
  /** Direção do sprite. Quando ausente, o `useNpcAI` calcula voltada ao jogador. */
  direction?: "left" | "right";
};
