import { createCommonProjectile } from "@/gameRules/npc/projectile/directionalProjectile";
import type {
  BehaviorContext,
  BehaviorResult,
} from "@/utils/types/npc/npcBehavior";

import type { EvilMortyAI } from "./state";
import {
  AERIAL_COOLDOWN_MS,
  AIR_JUMP_HEIGHT,
  AIR_LASER_DURATION_MS,
  AIR_LASER_LENGTH,
  ARENA_WIDTH,
  BEAM_TICK_MS,
  GRAVITY_CHARGE_MS,
  GRAVITY_DAMAGE_MULT,
  GRAVITY_DURATION_MS,
  GRAVITY_EXPAND_MS,
  GRAVITY_TICK_MS,
  ROCKET_INTERVAL_PHASE2,
  ROCKET_SPAWN_HEIGHT,
  ROCKETS_COOLDOWN_MS,
  ROCKETS_DURATION_MS,
  SPECIAL_COOLDOWN_MS,
} from "./state";
import {
  advanceAction,
  chaseAndJump,
  consumeTick,
  endAction,
  isInBeam,
  jumpArcY,
  startAction,
} from "./actions";

/**
 * Ataque básico das fases 2 e 3: mão levantada, foguetes caindo do alto em
 * cima do jogador a cada `interval`.
 *
 * "Teleguiado" aqui é mirar na posição do jogador no instante do disparo —
 * o projétil comum anda em linha reta. Decisão para revisar: correção de rota
 * em voo pede uma variante nova de `Projectile`.
 */
export function runRockets(
  ctx: BehaviorContext,
  ai: EvilMortyAI,
  now: number,
  interval: number,
): BehaviorResult {
  const { npc, playerX, playerY, projectile, setProjectile } = ctx;

  if (now - ai.actionStart >= ROCKETS_DURATION_MS) {
    endAction(ai);
    ai.lastBasic = now;
    return { x: npc.x, y: ai.groundY, state: "idle" };
  }

  if (!projectile && consumeTick(ai, now, interval)) {
    setProjectile(
      createCommonProjectile({
        startX: playerX,
        startY: playerY - ROCKET_SPAWN_HEIGHT,
        targetX: playerX,
        targetY: playerY - 60,
        sprite: "evilMortyRocket",
        state: "idle",
        damageType: "physical",
      }),
    );
  }

  return { x: npc.x, y: ai.groundY, state: "invoking" };
}

/**
 * Inicia o ataque básico de foguetes. O primeiro foguete sai no primeiro tick
 * (lastTick zerado), sem esperar um intervalo inteiro de mão levantada.
 */
export function startRockets(
  ctx: BehaviorContext,
  ai: EvilMortyAI,
  now: number,
): void {
  startAction(ai, "rockets", ctx, now);
  ai.lastTick = 0;
}

/**
 * Fase 2 (sério): foguetes, laser aéreo cobrindo 1/3 do mapa e a esfera
 * gravitacional de special.
 */
export function evilMortyPhase2(
  ctx: BehaviorContext,
  ai: EvilMortyAI,
): BehaviorResult {
  const now = Date.now();
  const { npc, playerX } = ctx;

  if (ai.action === "rockets") {
    return runRockets(ctx, ai, now, ROCKET_INTERVAL_PHASE2);
  }

  if (ai.action === "airLaser") {
    const progress = (now - ai.actionStart) / AIR_LASER_DURATION_MS;
    if (progress >= 1) {
      endAction(ai);
      ai.lastAerial = now;
      return { x: npc.x, y: ai.groundY, state: "landing" };
    }
    if (consumeTick(ai, now, BEAM_TICK_MS)) {
      if (isInBeam(npc.x, ai.actionDirection, AIR_LASER_LENGTH, playerX)) {
        ctx.onLaserHit?.(npc.x);
      }
    }
    return {
      x: npc.x,
      y: jumpArcY(ai.groundY, progress, AIR_JUMP_HEIGHT),
      state: "airAttack",
      direction: ai.actionDirection,
    };
  }

  if (ai.action === "gravityCharge") {
    if (now - ai.actionStart >= GRAVITY_CHARGE_MS) {
      advanceAction(ai, "gravity", now);
    }
    return { x: npc.x, y: ai.groundY, state: "charging" };
  }

  if (ai.action === "gravity") {
    const elapsed = now - ai.actionStart;
    if (elapsed >= GRAVITY_DURATION_MS) {
      endAction(ai);
      ai.lastSpecial = now;
      return { x: npc.x, y: ai.groundY, state: "idle" };
    }
    const radius = Math.min(elapsed / GRAVITY_EXPAND_MS, 1) * ARENA_WIDTH;
    if (
      consumeTick(ai, now, GRAVITY_TICK_MS) &&
      Math.abs(playerX - npc.x) <= radius
    ) {
      ctx.onMeleeHit(GRAVITY_DAMAGE_MULT, "magical");
    }
    return { x: npc.x, y: ai.groundY, state: "invoking" };
  }

  if (ai.jumpStart === 0 && now - ai.lastSpecial >= SPECIAL_COOLDOWN_MS) {
    startAction(ai, "gravityCharge", ctx, now);
    return { x: npc.x, y: ai.groundY, state: "charging" };
  }

  if (ai.jumpStart === 0 && now - ai.lastAerial >= AERIAL_COOLDOWN_MS) {
    startAction(ai, "airLaser", ctx, now);
    return { x: npc.x, y: ai.groundY, state: "airAttack" };
  }

  if (ai.jumpStart === 0 && now - ai.lastBasic >= ROCKETS_COOLDOWN_MS) {
    startRockets(ctx, ai, now);
    return { x: npc.x, y: ai.groundY, state: "invoking" };
  }

  return chaseAndJump(ctx, ai, now);
}
