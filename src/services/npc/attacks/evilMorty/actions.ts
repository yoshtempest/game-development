import { chasePlayer } from "@/gameRules/npc/movement";
import { clampX } from "@/gameRules/movement/clampX";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import { EVIL_MORTY_SPEED, toEvilMortyPhase } from "@/data/npc/evilMorty";
import type {
  BehaviorContext,
  BehaviorResult,
} from "@/utils/types/npc/npcBehavior";

import type { EvilMortyAI, EvilMortyAction } from "./state";
import {
  CHASE_JUMP_DURATION,
  CHASE_JUMP_HEIGHT,
  CHASE_JUMP_INTERVAL,
  CHASE_STOP_DISTANCE,
  MINE_ARM_MS,
  MINE_DAMAGE_MULT,
  MINE_LIFETIME_MS,
  MINE_MAX_COUNT,
  MINE_MIN_COUNT,
  MINE_RADIUS,
  MINE_SPREAD,
} from "./state";

/** Inicia uma ação, travando a direção atual para os feixes. */
export function startAction(
  ai: EvilMortyAI,
  action: EvilMortyAction,
  ctx: BehaviorContext,
  now: number,
): void {
  ai.action = action;
  ai.actionStart = now;
  ai.lastTick = now;
  ai.actionDirection = ctx.playerX >= ctx.npc.x ? "right" : "left";
  ai.burnApplied = false;
  ai.minesDropped = false;
}

/**
 * Passa para a próxima etapa da mesma sequência (carga → feixe) mantendo a
 * direção travada: o feixe sai para onde a carga avisou, não para onde o
 * jogador fugiu durante o aviso.
 */
export function advanceAction(
  ai: EvilMortyAI,
  action: EvilMortyAction,
  now: number,
): void {
  ai.action = action;
  ai.actionStart = now;
  ai.lastTick = now;
}

/** Encerra a ação e volta para a perseguição. */
export function endAction(ai: EvilMortyAI): void {
  ai.action = "none";
  ai.actionStart = 0;
}

/** Y de um arco de pulo de `height` px, com `progress` em [0, 1]. */
export function jumpArcY(
  groundY: number,
  progress: number,
  height: number,
): number {
  const clamped = Math.min(Math.max(progress, 0), 1);
  return groundY - Math.sin(Math.PI * clamped) * height;
}

/**
 * true quando chegou a hora do próximo tick de dano de uma ação contínua
 * (feixe, aura, esfera), já registrando o tick.
 */
export function consumeTick(
  ai: EvilMortyAI,
  now: number,
  interval: number,
): boolean {
  if (now - ai.lastTick < interval) return false;
  ai.lastTick = now;
  return true;
}

/**
 * true quando `playerX` está dentro do feixe que nasce em `fromX` e segue
 * `length` px na direção `direction`.
 *
 * A faixa é sempre `[min(from,to), max(from,to)]` (regra dos lasers do
 * AGENTS.md), independente do lado para onde o feixe aponta.
 */
export function isInBeam(
  fromX: number,
  direction: "left" | "right",
  length: number,
  playerX: number,
): boolean {
  const toX = direction === "right" ? fromX + length : fromX - length;
  return playerX >= Math.min(fromX, toX) && playerX <= Math.max(fromX, toX);
}

/** true quando o jogador está no ar (pulando): passa por cima do que é rente ao chão. */
export function isPlayerAirborne(ctx: BehaviorContext): boolean {
  return ALL_PREDICATES.isAirborne(ctx.playerState);
}

/**
 * Perseguição padrão: corre na velocidade da fase e pula de tempos em tempos.
 *
 * O pulo é só deslocamento (a issue: "ele pula e corre em todas as fases para
 * caçar o jogador"), não causa dano — o que machuca são os ataques.
 */
export function chaseAndJump(
  ctx: BehaviorContext,
  ai: EvilMortyAI,
  now: number,
): BehaviorResult {
  const { npc, targetX, playerY, npcPhase } = ctx;
  const speed = EVIL_MORTY_SPEED[toEvilMortyPhase(npcPhase)];
  const { x } = chasePlayer(npc, targetX, playerY, speed, CHASE_STOP_DISTANCE);
  const distance = Math.abs(targetX - npc.x);

  if (ai.jumpStart === 0 && now - ai.lastJump >= CHASE_JUMP_INTERVAL) {
    ai.jumpStart = now;
    ai.lastJump = now;
  }

  if (ai.jumpStart !== 0) {
    const progress = (now - ai.jumpStart) / CHASE_JUMP_DURATION;
    if (progress >= 1) {
      ai.jumpStart = 0;
      return { x: clampX(x), y: ai.groundY, state: "landing" };
    }
    return {
      x: clampX(x),
      y: jumpArcY(ai.groundY, progress, CHASE_JUMP_HEIGHT),
      state: "jump",
    };
  }

  return {
    x: clampX(x),
    y: ai.groundY,
    state: distance > CHASE_STOP_DISTANCE ? "run" : "idle",
  };
}

/** Larga 2-3 minas ao redor do jogador. */
export function dropMines(
  ai: EvilMortyAI,
  playerX: number,
  now: number,
  random: () => number = Math.random,
): void {
  const count =
    MINE_MIN_COUNT +
    Math.floor(random() * (MINE_MAX_COUNT - MINE_MIN_COUNT + 1));
  const first = -((count - 1) * MINE_SPREAD) / 2;
  for (let i = 0; i < count; i++) {
    ai.mines.push({
      x: clampX(playerX + first + i * MINE_SPREAD),
      armedAt: now + MINE_ARM_MS,
      expiresAt: now + MINE_LIFETIME_MS,
    });
  }
}

/**
 * Detona as minas armadas sob o jogador e descarta as vencidas.
 *
 * Roda em todo tick da fase 3, inclusive durante outras ações: mina no chão
 * não espera o dono terminar o que está fazendo. Pular por cima desvia.
 */
export function updateMines(
  ctx: BehaviorContext,
  ai: EvilMortyAI,
  now: number,
): void {
  if (ai.mines.length === 0) return;
  const airborne = isPlayerAirborne(ctx);
  ai.mines = ai.mines.filter((mine) => {
    if (now >= mine.expiresAt) return false;
    if (now < mine.armedAt || airborne) return true;
    if (Math.abs(ctx.playerX - mine.x) > MINE_RADIUS) return true;
    ctx.onMeleeHit(MINE_DAMAGE_MULT, "physical");
    return false;
  });
}
