import { isOf } from "./isOf";
import { ALL_STATES } from "./constants";

// ── Predicados ────────────────────────────────────────────
export const isMoveState = isOf(ALL_STATES.MOVE_STATES);
export const isRunState = isOf(ALL_STATES.RUN_STATES);
export const isCrouched = isOf(ALL_STATES.CROUCHED_STATES);
export const isDashing = isOf(ALL_STATES.DASH_STATES);
export const isAirborne = isOf(ALL_STATES.AIRBORNE_STATES);
export const isAirFalling = isOf(ALL_STATES.AIR_FALL_STATES);
export const isLanding = isOf(ALL_STATES.LANDING_STATES);
export const isAirAbility = isOf(ALL_STATES.AIR_ABILITY_STATES);
export const isAirMelee = isOf(ALL_STATES.AIR_MELEE_STATES);
export const isAirFrozen = isOf(ALL_STATES.AIR_FROZEN_STATES);
export const isBasicStrike = isOf(ALL_STATES.BASIC_STRIKE_STATES);
export const isAbilityStrike = isOf(ALL_STATES.ABILITY_STRIKE_STATES);
export const isStrike = isOf(ALL_STATES.STRIKE_STATES);
export const isAttackWindup = isOf(ALL_STATES.ATTACK_WINDUP_STATES);
export const isAttackPose = isOf(ALL_STATES.ATTACK_POSE_STATES);
export const isAbilityTrigger = isOf(ALL_STATES.ABILITY_TRIGGER_STATES);
export const isGenkiDama = isOf(ALL_STATES.GENKI_DAMA_STATES);
export const isGenkiDamaHold = isOf(ALL_STATES.GENKI_DAMA_HOLD_STATES);
export const isAtomic = isOf(ALL_STATES.ATOMIC_STATES);
export const isDomainExpansion = isOf(ALL_STATES.DOMAIN_EXPANSION_STATES);
export const isLaser = isOf(ALL_STATES.LASER_STATES);
export const isGranReyCero = isOf(ALL_STATES.GRAN_REY_CERO_STATES);
export const isSphere = isOf(ALL_STATES.SPHERE_STATES);
export const isRiquelmeDomain = isOf(ALL_STATES.RIQUELME_DOMAIN_STATES);
export const isBlock = isOf(ALL_STATES.BLOCK_STATES);
export const isHitReaction = isOf(ALL_STATES.HIT_REACTION_STATES);
export const isActionLocked = isOf(ALL_STATES.ACTION_LOCK_STATES);
export const isActionBlocked = isOf(ALL_STATES.CANNOT_ACT_STATES);
export const isIdlePreserved = isOf(ALL_STATES.IDLE_PRESERVED_STATES);
export const isIdleBlocked = isOf(ALL_STATES.IDLE_BLOCKED_STATES);
export const isInvulnerable = isOf(ALL_STATES.INVULNERABLE_STATES);
export const isNpcUnhittable = isOf(ALL_STATES.NPC_UNHITTABLE_STATES);
export const hasHorizontalControl = (state: PlayerState) =>
  !ALL_STATES.HORIZONTAL_CONTROL_LOCKED_STATES.has(state);
export const canStartAbilityFrom = (state: PlayerState) =>
  !ALL_STATES.ABILITY_LOCKED_STATES.has(state);
export const isGroundCombo = isOf(ALL_STATES.GROUND_COMBO_STATES);
export const isCombo = isOf(ALL_STATES.COMBO_STATES);

export const ALL_PREDICATES = {
  // Locomoção
  isMoveState,
  isRunState,
  isCrouched,
  isDashing,

  // Ar
  isAirborne,
  isAirFalling,
  isLanding,
  isAirAbility,
  isAirMelee,
  isAirFrozen,

  // Golpes
  isBasicStrike,
  isAbilityStrike,
  isStrike,
  isAttackWindup,
  isAttackPose,
  isAbilityTrigger,

  // Habilidades
  isGenkiDama,
  isGenkiDamaHold,
  isAtomic,
  isDomainExpansion,
  isLaser,
  isGranReyCero,
  isSphere,
  isRiquelmeDomain,

  // Defesa e reação
  isBlock,
  isHitReaction,
  isInvulnerable,
  isNpcUnhittable,

  // Travamento
  isActionLocked,
  isActionBlocked,
  isIdlePreserved,
  isIdleBlocked,
  hasHorizontalControl,
  canStartAbilityFrom,

  // Combo
  isGroundCombo,
  isCombo,
} as const;
