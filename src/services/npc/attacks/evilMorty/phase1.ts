import { createCommonProjectile } from "@/gameRules/npc/projectile/directionalProjectile";
import type {
  BehaviorContext,
  BehaviorResult,
} from "@/utils/types/npc/npcBehavior";

import type { EvilMortyAI } from "./state";
import {
  ARENA_WIDTH,
  BEAM_TICK_MS,
  LASER_CHARGE_MS,
  LASER_DURATION_MS,
  LASER_SHOT_INTERVAL,
  SPECIAL_COOLDOWN_MS,
} from "./state";
import {
  advanceAction,
  chaseAndJump,
  consumeTick,
  endAction,
  isInBeam,
  isPlayerAirborne,
  startAction,
} from "./actions";

/**
 * Feixe de luz rente ao chão do special da fase 1.
 *
 * Nasce no Evil Morty e vai até a ponta do mapa na direção travada no início
 * da carga. Pular desvia: a damageZone de aviso existe justamente para o
 * jogador ter tempo de sair do chão.
 */
export function tickGroundLaser(
  ctx: BehaviorContext,
  ai: EvilMortyAI,
  now: number,
): void {
  if (!consumeTick(ai, now, BEAM_TICK_MS)) return;
  if (isPlayerAirborne(ctx)) return;
  if (!isInBeam(ctx.npc.x, ai.actionDirection, ARENA_WIDTH, ctx.playerX)) {
    return;
  }
  ctx.onLaserHit?.(ctx.npc.x);
}

/**
 * Fase 1 (entediado): tiro da arma laser a cada 500ms e, de special, a mão à
 * frente com damageZone de aviso seguida do feixe.
 */
export function evilMortyPhase1(
  ctx: BehaviorContext,
  ai: EvilMortyAI,
): BehaviorResult {
  const now = Date.now();
  const { npc, playerX, playerY, projectile, setProjectile } = ctx;

  if (ai.action === "laserCharge") {
    if (now - ai.actionStart >= LASER_CHARGE_MS) {
      advanceAction(ai, "laser", now);
    }
    return {
      x: npc.x,
      y: ai.groundY,
      state: "charging",
      direction: ai.actionDirection,
    };
  }

  if (ai.action === "laser") {
    if (now - ai.actionStart >= LASER_DURATION_MS) {
      endAction(ai);
      ai.lastSpecial = now;
      return { x: npc.x, y: ai.groundY, state: "idle" };
    }
    tickGroundLaser(ctx, ai, now);
    return {
      x: npc.x,
      y: ai.groundY,
      state: "laser",
      direction: ai.actionDirection,
    };
  }

  if (ai.jumpStart === 0 && now - ai.lastSpecial >= SPECIAL_COOLDOWN_MS) {
    startAction(ai, "laserCharge", ctx, now);
    return {
      x: npc.x,
      y: ai.groundY,
      state: "charging",
      direction: ai.actionDirection,
    };
  }

  if (!projectile && now - ai.lastBasic >= LASER_SHOT_INTERVAL) {
    ai.lastBasic = now;
    setProjectile(
      createCommonProjectile({
        startX: npc.x,
        startY: npc.y - 120,
        targetX: playerX,
        targetY: playerY - 80,
        sprite: "evilMortyLaserShot",
        state: "idle",
        damageType: "magical",
      }),
    );
  }

  return chaseAndJump(ctx, ai, now);
}
