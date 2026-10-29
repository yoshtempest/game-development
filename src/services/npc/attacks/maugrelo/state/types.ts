import type { NewPlayerStatus } from "@/gameRules/battle/status/statusEffects";

export type GroundPaper = {
  id: number;
  x: number;
  y: number;
  sprite: "paper" | "explosion";
  createdAt: number;
  /** Quando o papel foi armado (pisado). undefined = ainda inerte. */
  armedAt?: number;
};

export type StuckPaper = {
  id: number;
  stuckAt: number;
  /** Quando o papel começou a explodir (explosion.svg). undefined = ainda paper.svg. */
  explodeAt?: number;
};

export type FlyingPaper = {
  x: number;
  y: number;
  velX: number;
  velY: number;
};

export type OrbitPaper = {
  id: number;
  angle: number;
};

export type LaserBeam = {
  active: boolean;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  dirX: 1 | -1;
  phase: "starting" | "active" | "ending";
};

export type MaugreloAI = {
  knownPhase: number;
  actionState: "idle" | "preMove" | "action" | "postAction" | "meditating";
  actionStart: number;
  currentAction: "throw" | "slap" | "push" | null;
  meleeHitTriggered: boolean;
  lastThrow: number;
  lastSlap: number;
  lastPush: number;
  flyingPaper: FlyingPaper | null;
  groundPapers: GroundPaper[];
  landedPapers: GroundPaper[];
  stuckPapers: StuckPaper[];
  paperIdCounter: number;
  lastPaperHitId: number;
  meditationArmorBonus: number;
  lastArmorBuff: number;
  walkingStartTime: number;
  phase2State:
    | "rising"
    | "orbiting"
    | "descending"
    | "landing"
    | "preMove"
    | "laser"
    | "vulnerable"
    | "debuff"
    | "throwPapers"
    | "charging"
    | "push";
  riseStartY: number;
  orbitPapers: OrbitPaper[];
  lastPaperFire: number;
  phase2StageStart: number;
  laser: LaserBeam | null;
  lastLaserDamage: number;
  appliedDebuff: NewPlayerStatus | null;
  papersThrownCount: number;
  lastPaperThrow: number;
  pushHitTriggered: boolean;
};
