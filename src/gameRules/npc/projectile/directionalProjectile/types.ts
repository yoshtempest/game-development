import type { DamageKind } from "@/utils/types/battle/damageKind";

export type CommonParams = {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  sprite?: string;
  state?: "walk" | "idle";
  canCrouchDodge?: boolean;
  landsOnGround?: boolean;
  hp?: number;
  maxHp?: number;
  indestructible?: boolean;
  /** Natureza do dano ao acertar: define a coluna de armadura furada. */
  damageType?: DamageKind;
  /** Status com chance de ser aplicado no player ao acertar. */
  onHitStatus?: ProjectileOnHitStatus;
};

export type PullParams = CommonParams & {
  pullTargetX: number;
};

export type RainParams = {
  x?: number;
  y?: number;
  sprite?: string;
  warningDuration: number;
  spearPositions: number[];
  hp?: number;
  maxHp?: number;
  indestructible?: boolean;
  /** Natureza do dano ao acertar: define a coluna de armadura furada. */
  damageType?: DamageKind;
};
