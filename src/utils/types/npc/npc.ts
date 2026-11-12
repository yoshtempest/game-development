export type NPCDirection = "right" | "left";

export type NPCBattleState = {
  x: number;
  y: number;
  state:
    | "idle"
    | "walk"
    | "default"
    | "hit"
    | "jumping"
    | "pitch"
    | "inAir"
    | "falling"
    | "airAttack"
    | "preAttack"
    | "preJump"
    | "attack"
    | "inJump"
    | "jumpAttack"
    | "block"
    | "meleeAttack"
    | "rangedAttack"
    | "get"
    | "throw"
    | "startDash"
    | "inDash"
    | "startThrow"
    | "throwing"
    | "throwed"
    | "startSpin"
    | "inSpin"
    | "finishSpin"
    | "preMove"
    | "run"
    | "slap"
    | "push"
    | "meditating"
    | "flying"
    | "landing"
    | "laser"
    | "debuff"
    | "throwPapers"
    | "charging"
    | "invoking"
    | "dig"
    | "entering"
    | "entered"
    | "fall"
    | "giveMeMyPower"
    | "jump"
    | "prePunch"
    | "punch"
    | "preKick"
    | "kick";
  direction: NPCDirection;
  jumpLandingX?: number;
  /** Oculta o NPC (ex: alfa cavando no subsolo). Persiste até ser limpo. */
  hidden?: boolean;

  ai?: {
    slimita?: {
      state: "idle" | "air" | "resting";
      startTime: number;
      targetX: number;
      lastPullThrow: number;
      lastMeleeAttack: number;
      lastRangedAttack: number;
      phase1HopState: "ground" | "jumping";
      phase1HopStart: number;
      phase1HopStartX: number;
      phase1BaseY: number;
      phase1DashState: "idle" | "dashing";
      phase1DashStart: number;
      phase1DashStartX: number;
      phase1DashTargetX: number;
      phase1DashHitDone: boolean;
    };
    deise?: {
      knownPhase: number;
      lastStaffThrow: number;
      lastSummon: number;
      lastAction: number;
      dashState: "idle" | "windUp" | "dashing" | "postDash";
      dashStart: number;
      dashStartX: number;
      dashDirection: "left" | "right";
      dashEndX: number;
      dashElapsed: number;
      lastDashTick: number;
      lastDash: number;
      lastDashDamage: number;
      postDashStart: number;
    };
    hungryKing?: {
      knownPhase: number;
      hasSummoned: boolean;
      jumpState: "idle" | "jumping" | "inJump" | "jumpAttack";
      jumpStartTime: number;
      jumpTargetX: number;
      lastJump: number;
      landingTime: number;
      summonEndTime: number;
      burstState: "idle" | "windup";
      burstStartTime: number;
      lastBurst: number;
      lastSpriteState?: string;
    };
    vandinha?: {
      lastMeleeAttack: number;
      lastRangedAttack: number;
    };
    jhowsimar?: {
      attackCount: number;
      grabPhase: "get" | "throw" | null;
      startTime: number;
    };
    hungryDeath?: {
      grabPhase: "grabbing" | null;
      grabStartTime: number;
      attackCount: number;
      lastMeleeAttack: number;
      lastGrabEndTime: number;
    };
    goat?: {
      jumpState: "idle" | "jumping" | "inJump" | "jumpAttack";
      jumpStartTime: number;
      jumpTargetX: number;
      lastJump: number;
      landingTime: number;
      lastSpriteState?: string;
      lastMeleeAttack: number;
    };
    maurao?: {
      knownPhase: number;
      dashState: "idle" | "windUp" | "dashing" | "postDash";
      dashStart: number;
      dashStartX: number;
      dashTargetX: number;
      dashHitDone: boolean;
      lastMeleeAttack: number;
      postDashStart: number;
      throwState: "idle" | "startThrow" | "throwing" | "throwed";
      throwStart: number;
      lastRangedAttack: number;
      spinState: "idle" | "spinning" | "resting";
      spinStart: number;
      spinRestStart: number;
      lastSpinHit: number;
      spinHitCount: number;
    };
    maugrelo?: import("@/services/npc/attacks/maugrelo/state").MaugreloAI;
    hungryDog?: import("@/services/npc/attacks/hungryDog/state").HungryDogAI;
    /**
     * Cooldown do cuspe ácido do hungryDog comum. Separado do `lastAttackRef`
     * para o cuspe não atrasar a mordida quando o jogador se aproxima.
     */
    hungryDogSpit?: { current: number };
  };
};
