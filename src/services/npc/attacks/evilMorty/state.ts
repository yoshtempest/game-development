import {
  ONE_HUNDRED_MS,
  TWO_HUNDRED_FIFTY_MS,
  FIVE_HUNDRED_MS,
  SIX_HUNDRED_MS,
  ONE_THOUSAND_MS,
  ONE_THOUSAND_FIVE_HUNDRED_MS,
  TWO_THOUSAND_MS,
  THREE_THOUSAND_MS,
  FIVE_THOUSAND_MS,
  SEVEN_THOUSAND_MS,
  EIGHT_THOUSAND_MS,
} from "@/data/ms";
import { BATTLE_LIMITS } from "@/gameRules/movement/constants";

/**
 * Ação em andamento. `none` = perseguindo (corre e pula); qualquer outra
 * trava a IA naquela sequência até o tempo dela acabar.
 */
export type EvilMortyAction =
  | "none"
  | "laserCharge"
  | "laser"
  | "rockets"
  | "airLaser"
  | "gravityCharge"
  | "gravity"
  | "mineJump"
  | "aura"
  | "timeStop"
  | "domainCharge"
  | "domainLaser";

/** Mina terrestre largada no ataque aéreo da fase 3. */
export type EvilMortyMine = {
  x: number;
  /** Instante a partir do qual a mina detona ao ser pisada. */
  armedAt: number;
  /** Instante em que a mina some sozinha, se ninguém pisar. */
  expiresAt: number;
};

export type EvilMortyAI = {
  knownPhase: number;
  /** Y do chão, lido no primeiro tick: o pulo é um arco a partir dele. */
  groundY: number;
  action: EvilMortyAction;
  actionStart: number;
  /** Direção travada no início de feixes, para o laser não girar junto. */
  actionDirection: "left" | "right";
  lastTick: number;
  lastBasic: number;
  lastSpecial: number;
  lastAerial: number;
  lastDomain: number;
  /** 0 = no chão; senão, instante em que o pulo de perseguição começou. */
  jumpStart: number;
  lastJump: number;
  burnApplied: boolean;
  minesDropped: boolean;
  mines: EvilMortyMine[];
};

/** Largura útil da arena: base dos feixes que cruzam o mapa. */
export const ARENA_WIDTH = BATTLE_LIMITS.maxX - BATTLE_LIMITS.minX;

/** Distância em que ele para de se aproximar enquanto persegue. */
export const CHASE_STOP_DISTANCE = 60;

/** Pulo de perseguição: "ele pula e corre em todas as fases". */
export const CHASE_JUMP_INTERVAL = TWO_THOUSAND_MS;
export const CHASE_JUMP_DURATION = SIX_HUNDRED_MS;
export const CHASE_JUMP_HEIGHT = 120;

/** Fase 1 — tiro da arma laser a cada 500ms (issue). */
export const LASER_SHOT_INTERVAL = FIVE_HUNDRED_MS;

/**
 * Fase 1 — special: mão à frente, damageZone de aviso e o feixe.
 *
 * O aviso é a janela de pular: o feixe é rente ao chão, então quem está no
 * ar passa por cima.
 */
export const LASER_CHARGE_MS = ONE_THOUSAND_MS;
export const LASER_DURATION_MS = TWO_THOUSAND_MS;

/**
 * Intervalo entre ticks de dano dos feixes.
 *
 * A issue fala em "1 de dano por ms"; a batalha roda em ticks de ~16ms e o
 * dano do laser sai do `onLaserHit` (que já aplica armadura e empurrão).
 * Decisão para revisar: 100ms por tick.
 */
export const BEAM_TICK_MS = ONE_HUNDRED_MS;

/** Fases 2 e 3 — mão levantada chamando foguetes teleguiados do alto. */
export const ROCKETS_DURATION_MS = THREE_THOUSAND_MS;
export const ROCKETS_COOLDOWN_MS = FIVE_THOUSAND_MS;
export const ROCKET_INTERVAL_PHASE2 = ONE_THOUSAND_MS;
export const ROCKET_INTERVAL_PHASE3 = FIVE_HUNDRED_MS;
/** Altura (px) acima do jogador em que o foguete nasce. */
export const ROCKET_SPAWN_HEIGHT = 400;

/** Fases 2 e 3 — ataque aéreo. */
export const AERIAL_COOLDOWN_MS = FIVE_THOUSAND_MS;
export const AIR_LASER_DURATION_MS = ONE_THOUSAND_FIVE_HUNDRED_MS;
/** O laser aéreo "passa por 1/3 do mapa". */
export const AIR_LASER_LENGTH = ARENA_WIDTH / 3;
export const AIR_JUMP_HEIGHT = 180;

/** Cooldown dos specials (todas as fases). */
export const SPECIAL_COOLDOWN_MS = EIGHT_THOUSAND_MS;

/** Fase 2 — esfera gravitacional que se expande pelo mapa todo. */
export const GRAVITY_CHARGE_MS = SIX_HUNDRED_MS;
export const GRAVITY_EXPAND_MS = ONE_THOUSAND_FIVE_HUNDRED_MS;
export const GRAVITY_DURATION_MS = THREE_THOUSAND_MS;
export const GRAVITY_TICK_MS = TWO_HUNDRED_FIFTY_MS;
export const GRAVITY_DAMAGE_MULT = 0.5;

/** Fase 3 — minas terrestres do ataque aéreo (2 a 3 por pulo). */
export const MINE_JUMP_DURATION_MS = SIX_HUNDRED_MS;
export const MINE_MIN_COUNT = 2;
export const MINE_MAX_COUNT = 3;
export const MINE_SPREAD = 90;
export const MINE_ARM_MS = FIVE_HUNDRED_MS;
export const MINE_LIFETIME_MS = EIGHT_THOUSAND_MS;
export const MINE_RADIUS = 40;
export const MINE_DAMAGE_MULT = 1.5;

/** Fase 3 — aura vermelha de 3s, 300px ao redor, dano massivo + queimação. */
export const AURA_DURATION_MS = THREE_THOUSAND_MS;
export const AURA_RADIUS = 300;
export const AURA_TICK_MS = TWO_HUNDRED_FIFTY_MS;
export const AURA_DAMAGE_MULT = 2;

/**
 * Fase 3 — Expansão de Domínio: botão que para o tempo, carga e um feixe 3×
 * maior que o da fase 2 por 7s que "mata o jogador".
 *
 * O tempo parado é o status `freeze` (é o que trava o jogador hoje). O feixe
 * é dano verdadeiro (`"true"`): nenhuma armadura deve segurar um golpe que a
 * issue define como letal. Decisão para revisar: multiplicador por tick.
 */
export const DOMAIN_COOLDOWN_MS = 30_000;
export const DOMAIN_FIRST_DELAY_MS = 10_000;
export const TIME_STOP_MS = FIVE_HUNDRED_MS;
export const DOMAIN_CHARGE_MS = ONE_THOUSAND_FIVE_HUNDRED_MS;
export const DOMAIN_LASER_MS = SEVEN_THOUSAND_MS;
export const DOMAIN_LASER_DAMAGE_MULT = 5;

export function initEvilMortyAi(
  npcPhase: number,
  groundY: number,
): EvilMortyAI {
  return {
    knownPhase: npcPhase,
    groundY,
    action: "none",
    actionStart: 0,
    actionDirection: "left",
    lastTick: 0,
    lastBasic: 0,
    lastSpecial: Date.now(),
    lastAerial: Date.now(),
    lastDomain: Date.now() - DOMAIN_COOLDOWN_MS + DOMAIN_FIRST_DELAY_MS,
    jumpStart: 0,
    lastJump: 0,
    burnApplied: false,
    minesDropped: false,
    mines: [],
  };
}

/**
 * Troca de fase: aborta a ação em curso e reinicia os cooldowns.
 *
 * As minas somem junto — elas pertencem à fase 3 e uma fase nova começa com
 * a arena limpa. Os cooldowns voltam a contar do zero para a fase não abrir
 * com um special instantâneo logo após a transição.
 */
export function handlePhaseChange(ai: EvilMortyAI, npcPhase: number): void {
  const now = Date.now();
  ai.knownPhase = npcPhase;
  ai.action = "none";
  ai.actionStart = 0;
  ai.lastTick = 0;
  ai.lastBasic = 0;
  ai.lastSpecial = now;
  ai.lastAerial = now;
  ai.lastDomain = now - DOMAIN_COOLDOWN_MS + DOMAIN_FIRST_DELAY_MS;
  ai.jumpStart = 0;
  ai.burnApplied = false;
  ai.minesDropped = false;
  ai.mines = [];
}
