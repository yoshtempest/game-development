import type {
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
  weapon?: string;
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
  sigiloPhase?: string;
  /** Postura do combo básico genérico em exibição (`Player.basicComboStep`). */
  basicComboStep?: number;
  /** Nick do jogador remoto acima do sprite (online). */
  nameTag?: string;
  babidiMachineGamaControl?: boolean;
  /** Nonces dos shields de bloqueio do babidi por lado (`0` = inativo). */
  babidiShieldSides?: BabidiShieldSides;
  /** Encerra o shield de um lado quando ele termina o fade-out. */
  onBabidiShieldEnd?: (side: BabidiShieldSide, nonce: number) => void;
  hakai?: boolean;
}
