import {
  EIGHT_HUNDRED_MS,
  FIFTY_MS,
  FIVE_HUNDRED_MS,
  ONE_HUNDRED_MS,
  SIX_HUNDRED_MS,
  TWO_THOUSAND_MS,
} from "@/data/ms";
import { STATUS_DURATIONS_MS } from "@/gameRules/battle/status/statusEffects";

import type { NewPlayerStatus } from "@/gameRules/battle/status/statusEffects";

/**
 * Golpes do Manim (issue #292), na ordem em que entram na rotação.
 *
 * - `atom`: comprime o jogador num átomo por 3s (paralisia) e chuta enquanto
 *   ele não pode reagir.
 * - `potion`: combina elementos químicos (`combine.svg`) e arremessa poções
 *   que aplicam um status ao acertar.
 * - `problem`: "isso é problema minha gente" — cálculos atravessam o fundo e
 *   tiram 1 de vida a cada 50ms de quem não está bloqueando.
 * - `taBom`: "tá bom?" 10x; cada fala empurra e causa dano que cresce +5 a
 *   cada instância sofrida.
 *
 * `nuke` não está na rotação: é o relógio de 1 minuto que força a derrota.
 */
export type ManimMove = "atom" | "potion" | "problem" | "taBom";

export const MANIM_MOVE_ROTATION: readonly ManimMove[] = [
  "atom",
  "potion",
  "problem",
  "taBom",
];

export type ManimAI = {
  battleStart: number;
  move: ManimMove | "chase" | "nuke";
  moveStart: number;
  lastMoveEnd: number;
  rotationIndex: number;
  atomReapplied: boolean;
  lastKick: number;
  potionsLeft: number;
  potionPhase: "combine" | "flying";
  potionStatus: NewPlayerStatus;
  potionNearPlayer: boolean;
  lastCalcTick: number;
  taBomCount: number;
  taBomLast: number;
  taBomDamage: number;
  nukeDetonated: boolean;
};

export function initManimAi(now: number): ManimAI {
  return {
    battleStart: now,
    move: "chase",
    moveStart: now,
    lastMoveEnd: now,
    rotationIndex: 0,
    atomReapplied: false,
    lastKick: 0,
    potionsLeft: 0,
    potionPhase: "combine",
    potionStatus: "poison",
    potionNearPlayer: false,
    lastCalcTick: now,
    taBomCount: 0,
    taBomLast: 0,
    taBomDamage: TA_BOM_BASE_DAMAGE,
    nukeDetonated: false,
  };
}

export const MANIM_MELEE_RANGE = 50;
/** Pausa de perseguição entre um golpe especial e o próximo (decisão para revisar). */
export const MANIM_MOVE_COOLDOWN = TWO_THOUSAND_MS;

/** Duração do átomo pedida na issue. */
export const ATOM_DURATION = 3000;
/**
 * O átomo reaproveita a paralisia (status que já trava o jogador) em vez de
 * criar um status novo. `applyPlayerStatus` só aceita a duração padrão via
 * `onApplyDebuff`, então a paralisia é reaplicada no meio do golpe para o
 * total fechar em `ATOM_DURATION`.
 */
export const ATOM_STATUS: NewPlayerStatus = "paralyze";
export const ATOM_REAPPLY_AT = Math.max(
  0,
  ATOM_DURATION - STATUS_DURATIONS_MS[ATOM_STATUS],
);
export const ATOM_KICK_INTERVAL = EIGHT_HUNDRED_MS;
export const ATOM_KICK_MULTIPLIER = 1;
export const ATOM_CHASE_SPEED = 2;

export const POTIONS_PER_MOVE = 3;
export const POTION_COMBINE_DURATION = EIGHT_HUNDRED_MS;
/**
 * Status que as poções podem aplicar. Paralisia e congelamento ficam de fora
 * porque o átomo já é o golpe de controle total (decisão para revisar).
 */
export const POTION_STATUSES: readonly NewPlayerStatus[] = [
  "poison",
  "burn",
  "confuse",
  "blind",
];
/** Distância em x da poção ao jogador que conta como "acertou" ao sumir. */
export const POTION_HIT_RADIUS_X = 60;
export const POTION_SPAWN_GRACE = ONE_HUNDRED_MS;

export const PROBLEM_DURATION = 5000;
export const PROBLEM_TICK_MS = FIFTY_MS;
export const PROBLEM_TICK_DAMAGE = 1;

export const TA_BOM_REPEATS = 10;
export const TA_BOM_INTERVAL = SIX_HUNDRED_MS;
export const TA_BOM_BASE_DAMAGE = 5;
export const TA_BOM_DAMAGE_STEP = 5;
/** Empurrão da primeira fala; cresce junto com o texto a cada repetição. */
export const TA_BOM_BASE_PUSH = 20;
export const TA_BOM_PUSH_STEP = 10;

/** Tempo de batalha até as bombas "Hiroshima + Nagasaki". */
export const NUKE_TRIGGER_MS = 60_000;
/** Tempo das bombas se juntando antes do clarão (decisão para revisar). */
export const NUKE_WINDUP = TWO_THOUSAND_MS + FIVE_HUNDRED_MS;
