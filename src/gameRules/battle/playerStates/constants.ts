import { stateSet } from "./stateSet";
import { unionOf } from "./unionOf";

// ── Locomoção ─────────────────────────────────────────────
/** Andar/correr no chão (`pre*` é o windup da animação). */
export const MOVE_STATES = stateSet<PlayerMoveState>("walk", "preRun", "run");
/** Corrida — usada para respeitar a passiva de sono (não evolui p/ `run`). */
export const RUN_STATES = stateSet<PlayerMoveState>("preRun", "run");
/** Dash — o deslocamento é rápido e não pode ser interceptado. */
export const DASH_STATES = stateSet<PlayerChargeState>("dash");
/** Agachado: abaixa a hitbox e golpes altos passam por cima. */
export const CROUCHED_STATES = stateSet<PlayerCrouchState>(
  "idleCrounched",
  "walkCrounched",
);

// ── Ar ────────────────────────────────────────────────────
/** No ar — a gravidade está no comando. */
export const AIRBORNE_STATES = stateSet<PlayerAirState>(
  "preJump",
  "jump",
  "falling",
  "fallingAttack",
);
/** No ar em movimento vertical (pulo iniciado ou queda), sem o windup. */
export const AIR_FALL_STATES = stateSet<PlayerAirState>("jump", "falling");
/** Subconjunto que volta ao chão ao tocar o solo. */
export const LANDING_STATES = unionOf(
  AIR_FALL_STATES,
  stateSet<PlayerAirState>("preJump"),
);
/** Habilidade ativa no ar (windup → execução → recuperação). */
export const AIR_ABILITY_STATES = stateSet<PlayerAirAbilityState>(
  "preAbilityInAir",
  "abilityInAir",
  "abilityInAirFinish",
);
/** Golpe aéreo do combo. */
export const AIR_MELEE_STATES = stateSet<PlayerAirMeleeState>(
  "airGrab",
  "airKick",
);
/**
 * Golpes que seguram o personagem no ar (o eixo Y fica congelado): habilidade
 * aérea e golpes aéreos do combo.
 */
export const AIR_FROZEN_STATES = unionOf(AIR_ABILITY_STATES, AIR_MELEE_STATES);

// ── Golpes ────────────────────────────────────────────────
/** Ataque básico já ativo (causa dano). */
export const BASIC_STRIKE_STATES = stateSet<PlayerBasicAttackState>(
  "attack",
  "crit",
);
/**
 * Habilidade ativa já em execução (causa dano). Precisa ser listado: os
 * projéteis do NPC são interceptados no alcance do golpe, e antes só `attack`
 * era aceito — nenhuma habilidade alcançava um projétil.
 */
export const ABILITY_STRIKE_STATES = stateSet<PlayerState>(
  "ability",
  "abilityInAir",
  "abilityInAirFinish",
);
/** Qualquer golpe ativo (básico ou habilidade). */
export const STRIKE_STATES = unionOf(
  BASIC_STRIKE_STATES,
  ABILITY_STRIKE_STATES,
);
/** Windup do ataque básico. */
export const ATTACK_WINDUP_STATES = stateSet<PlayerBasicAttackState>(
  "preAttack",
  "preKick",
);
/**
 * Ataque básico em pose: windup `preAttack` ou golpe `attack` segurado. É o
 * que o ORA do srGuaxinim mantém na pose de ataque.
 */
export const ATTACK_POSE_STATES = stateSet<PlayerBasicAttackState>(
  "preAttack",
  "attack",
);
/** Sequência da habilidade ativa de solo, do windup à execução. */
export const ABILITY_TRIGGER_STATES = stateSet<PlayerAbilityState>(
  "preAbility",
  "preAbility2",
  "ability",
);

// ── Habilidades ───────────────────────────────────────────
/** Genki Dama (ematron) — o personagem sobe e fica flutuando. */
export const GENKI_DAMA_STATES = stateSet<PlayerGenkiDamaState>(
  "genkiDamaRising",
  "preparingGenkiDama",
  "throwGenkiDama",
);
/** "I Am Atomic" (marshadow). */
export const ATOMIC_STATES = stateSet<PlayerAtomicState>(
  "preparingAtomic",
  "finalizatingAtomic",
);
/** Expansão de Domínio (marshadow). */
export const DOMAIN_EXPANSION_STATES = stateSet<PlayerDomainExpansionState>(
  "preMugetsu",
  "mugetsu",
);
/** Expansão de Domínio do natsuki (Muryōkūsho) — pose `rioiki.svg` por 5s. */
export const NATSUKI_DOMAIN_STATES =
  stateSet<PlayerNatsukiDomainState>("rioiki");
/** Laser da Forma Vastolord (marshadow). */
export const LASER_STATES = stateSet<PlayerLaserState>("laser");
/** "Gran Rey Cero" (marshadow). */
export const GRAN_REY_CERO_STATES =
  stateSet<PlayerGranReyCeroState>("granReyCero");

/**
 * Kamehameha do ematron: fase de carga (`chargingKamehameha`, sprite
 * `chargingKamehameha.svg`) e fase de disparo (`kamehameha`, sprite
 * `kamehameha.svg` + efeito `kamehamehaEffect`).
 */
export const KAMEHAMEHA_STATES = stateSet<PlayerKamehamehaState>(
  "chargingKamehameha",
  "kamehameha",
);
/**
 * Esferas do natsuki (blue/red) e a fusão delas na purple: a sequência é
 * conduzida pelo hook `useNatsukiSpheres`; `purpleJunction` é a fusão (blue +
 * red convergindo) e `blueSphereControl` é o Hold do controle da blue.
 */
export const SPHERE_STATES = stateSet<PlayerSphereState>(
  "purpleJunction",
  "sphereCast",
  "sphereMove",
  "sphereFire",
  "blueSphereControl",
);

// ── Defesa e reação ───────────────────────────────────────
/** Defesa: bloqueio e a contra-ofensiva que sai dele. */
export const BLOCK_STATES = stateSet<PlayerBlockState>(
  "blocked",
  "blockAttack",
);
/** Reações que tiram o controle do jogador. */
export const HIT_REACTION_STATES = stateSet<PlayerHitState>("stun", "fallen");
/** Bloqueio ou atordoamento — o jogador não age, mas não está contido. */
const BLOCK_OR_STUN_STATES = stateSet<PlayerState>("blocked", "stun");

// ── Travamento ────────────────────────────────────────────
/** Estados que seguram o personagem e travam novas ações. */
export const ACTION_LOCK_STATES = unionOf(
  stateSet<PlayerActionLockState>(
    "dash",
    "charging",
    "chargingKi",
    "mostHonored",
    "genkiDamaRising",
    "preparingGenkiDama",
    "throwGenkiDama",
    "laser",
    "granReyCero",
    "chargingKamehameha",
    "kamehameha",
  ),
  SPHERE_STATES,
  NATSUKI_DOMAIN_STATES,
);
/** O jogador não age: trava de ação, defesa ou reação a dano. */
export const CANNOT_ACT_STATES = unionOf(
  ACTION_LOCK_STATES,
  BLOCK_OR_STUN_STATES,
);
/** `idle` não entra: defesa em curso, atordoamento ou contido no chão. */
export const IDLE_BLOCKED_STATES = unionOf(
  BLOCK_OR_STUN_STATES,
  HIT_REACTION_STATES,
);
/** `idle` não sobrescreve estes — o estado em curso é mais importante. */
export const IDLE_PRESERVED_STATES = unionOf(
  ACTION_LOCK_STATES,
  stateSet<PlayerAirState>("jump"),
);
/** Passiva "O Abençoado": enquanto ativo nenhum golpe do NPC causa dano. */
export const INVULNERABLE_STATES = stateSet<PlayerHonoredState>("mostHonored");
/** Sem alvo ao alcance do NPC: invencível ou flutuando acima do golpe. */
export const NPC_UNHITTABLE_STATES = unionOf(
  INVULNERABLE_STATES,
  GENKI_DAMA_STATES,
);
/**
 * Estados em que o jogador não tem controle no plano horizontal: no ar
 * (não bloqueia, não dasha) ou durante o O Abençoado.
 */
export const HORIZONTAL_CONTROL_LOCKED_STATES = unionOf(
  stateSet<PlayerAirState>("jump"),
  INVULNERABLE_STATES,
);
/** Trava a entrada da habilidade ativa (defesa, atordoamento e O Abençoado). */
export const ABILITY_LOCKED_STATES = unionOf(
  BLOCK_OR_STUN_STATES,
  INVULNERABLE_STATES,
);

// ── Combo do ematron ──────────────────────────────────────
/** Golpes de solo do combo. */
export const GROUND_COMBO_STATES = stateSet<PlayerComboState>(
  "punch",
  "hook",
  "lowKick",
);
/** Qualquer golpe do combo, solo ou aéreo. */
export const COMBO_STATES = unionOf(GROUND_COMBO_STATES, AIR_MELEE_STATES);

export const ALL_STATES = {
  // Locomoção
  MOVE_STATES,
  RUN_STATES,
  DASH_STATES,
  CROUCHED_STATES,

  // Ar
  AIRBORNE_STATES,
  AIR_FALL_STATES,
  LANDING_STATES,
  AIR_ABILITY_STATES,
  AIR_MELEE_STATES,
  AIR_FROZEN_STATES,

  // Golpes
  BASIC_STRIKE_STATES,
  ABILITY_STRIKE_STATES,
  STRIKE_STATES,
  ATTACK_WINDUP_STATES,
  ATTACK_POSE_STATES,
  ABILITY_TRIGGER_STATES,

  // Habilidades
  GENKI_DAMA_STATES,
  ATOMIC_STATES,
  DOMAIN_EXPANSION_STATES,
  LASER_STATES,
  GRAN_REY_CERO_STATES,
  SPHERE_STATES,
  NATSUKI_DOMAIN_STATES,
  KAMEHAMEHA_STATES,

  // Defesa e reação
  BLOCK_STATES,
  HIT_REACTION_STATES,
  BLOCK_OR_STUN_STATES,

  // Travamento
  ACTION_LOCK_STATES,
  CANNOT_ACT_STATES,
  IDLE_BLOCKED_STATES,
  IDLE_PRESERVED_STATES,
  INVULNERABLE_STATES,
  NPC_UNHITTABLE_STATES,
  HORIZONTAL_CONTROL_LOCKED_STATES,
  ABILITY_LOCKED_STATES,

  // Combo
  GROUND_COMBO_STATES,
  COMBO_STATES,
} as const;
