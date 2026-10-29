import type {
  BabidiPortalCross,
  BabidiShieldSide,
  BabidiShieldSides,
} from "@/utils/types/character/babidi";
import type { BabidiAttackVariant } from "@/utils/types/character/babidi/attack";

export interface PlayerBattleProps {
  x: number;
  y: number;
  PLAYER_SIZE: number;
  state: PlayerState;
  direction: Direction;
  character: CharacterId;
  weapon?: YvelWeapon;
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
  /** Pose de mão do sprite do ataque básico do babidi. */
  babidiAttackVariant?: BabidiAttackVariant;
  /** Nonces dos shields de bloqueio do babidi por lado (`0` = inativo). */
  babidiShieldSides?: BabidiShieldSides;
  /** Encerra o shield de um lado quando ele termina o fade-out. */
  onBabidiShieldEnd?: (side: BabidiShieldSide, nonce: number) => void;
  /** Player saindo de um portal do babidi (voo/decolagem). */
  babidiPortalLanding?: boolean;
  /**
   * Travessia em andamento por um portal terrestre: a parte do sprite abaixo da
   * linha do portal some de um lado e reaparece saindo do outro.
   */
  babidiPortalCross?: BabidiPortalCross | null;
  hakai?: boolean;
}
