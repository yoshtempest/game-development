import type {
  LucauaAttackVariant,
  LucauaPortalCross,
  LucauaShieldSide,
  LucauaShieldSides,
} from "@/utils/types/character/lucaua/lucaua";

export interface PlayerBattleProps {
  x: number;
  y: number;
  PLAYER_SIZE: number;
  state: PlayerState;
  direction: Direction;
  character: CharacterId;
  weapon?: LucasWeapon;
  grabbedUntil?: number;
  grabFlipped?: boolean;
  form?: "vastolordForm";
  transformationFrame?: number | null;
  blinkSilhouette?: "black" | "white" | null;
  teleportSprite?: boolean;
  preAtomic?: boolean;
  /** Vitória/derrota: sprite na arena vira expressions/<tipo>.svg. */
  outroExpression?: "victory" | "defeat" | null;
  atomicHalo?: boolean;
  atomicFlash?: boolean;
  mugetsuBlink?: "out" | "in" | null;
  levelUpParticles?: boolean;
  /** Pose de mão do sprite do ataque básico do lucaua. */
  lucauaAttackVariant?: LucauaAttackVariant;
  /** Nonces dos shields de bloqueio do lucaua por lado (`0` = inativo). */
  lucauaShieldSides?: LucauaShieldSides;
  /** Encerra o shield de um lado quando ele termina o fade-out. */
  onLucauaShieldEnd?: (side: LucauaShieldSide, nonce: number) => void;
  /** Player saindo de um portal do lucaua (voo/decolagem). */
  lucauaPortalLanding?: boolean;
  /**
   * Travessia em andamento por um portal terrestre: a parte do sprite abaixo da
   * linha do portal some de um lado e reaparece saindo do outro.
   */
  lucauaPortalCross?: LucauaPortalCross | null;
}
