import type {
  BehaviorContext,
  BehaviorResult,
} from "@/utils/types/npc/npcBehavior";
import type { MaugreloAI } from "@/services/npc/attacks/maugrelo/state";
import {
  PHASE2_RISE_DISTANCE,
  PHASE2_RISE_SPEED,
  PHASE2_DESCEND_SPEED,
  PHASE2_LANDING_DURATION,
  PHASE2_PREMOVE_DURATION,
  PHASE2_LASER_DURATION,
  ORBIT_COUNT,
} from "@/services/npc/attacks/maugrelo/state";
import {
  cleanupExplosions,
  checkGroundPaperHits,
  updateArmedPapers,
  checkPaperAttackHits,
  updateStuckPapers,
} from "@/services/npc/attacks/maugrelo/papers";
import { distributeOrbitPapers } from "./distributeOrbitPapers";
import { orbitPositions } from "./orbitPositions";
import { handleFirePaper } from "@/services/npc/attacks/maugrelo/actions/index";
import { updateLaser } from "./updateLaser";
import { handleDebuff } from "@/services/npc/attacks/maugrelo/actions/index";
import { handleThrowPapers } from "@/services/npc/attacks/maugrelo/actions/index";
import { handleCharging } from "@/services/npc/attacks/maugrelo/actions/index";
import { handlePhase2Push } from "@/services/npc/attacks/maugrelo/actions/index";
import { handleVulnerable } from "@/services/npc/attacks/maugrelo/actions/index";

export function maugreloPhase2(
  ctx: BehaviorContext,
  ai: MaugreloAI,
): BehaviorResult {
  const { npc } = ctx;
  const now = Date.now();

  cleanupExplosions(ai, now);
  checkGroundPaperHits(ai, ctx.playerX, ctx.playerY, ctx.onGroundPaperHit, now);
  updateArmedPapers(ai, ctx.playerX, ctx.playerY, ctx.onGroundPaperHit, now);
  checkPaperAttackHits(
    ai,
    ctx.playerX,
    ctx.playerState,
    ctx.playerDirection,
    ctx.onPaperExplode,
    now,
  );
  updateStuckPapers(
    ai,
    ctx.playerState,
    ctx.playerX,
    now,
    ctx.onStuckPaperExplode,
  );

  const orbitingY = ai.riseStartY - PHASE2_RISE_DISTANCE;

  if (ai.phase2State === "rising") {
    if (ai.riseStartY === 0) ai.riseStartY = npc.y;

    const risen = ai.riseStartY - npc.y;
    if (risen >= PHASE2_RISE_DISTANCE) {
      ai.phase2State = "orbiting";
      ai.orbitPapers = [];
      distributeOrbitPapers(ai, ORBIT_COUNT);
      ai.phase2StageStart = now;
    } else {
      return {
        x: npc.x,
        y: npc.y - PHASE2_RISE_SPEED,
        state: "flying",
      };
    }
  }

  if (ai.phase2State === "orbiting") {
    ai.groundPapers = orbitPositions(ai, npc.x, orbitingY);

    if (ai.orbitPapers.length === 0) {
      ai.phase2State = "descending";
      ai.phase2StageStart = now;
      ai.groundPapers = [];
    } else {
      handleFirePaper(ai, ctx, npc.x, orbitingY, now);
    }

    return { x: npc.x, y: orbitingY, state: "flying" };
  }

  if (ai.phase2State === "descending") {
    const nextY = npc.y + PHASE2_DESCEND_SPEED;

    if (nextY >= ai.riseStartY) {
      ai.phase2State = "landing";
      ai.phase2StageStart = now;
      return { x: npc.x, y: ai.riseStartY, state: "landing" };
    }

    return { x: npc.x, y: nextY, state: "flying" };
  }

  if (ai.phase2State === "landing") {
    if (now - ai.phase2StageStart >= PHASE2_LANDING_DURATION) {
      ai.phase2State = "preMove";
      ai.phase2StageStart = now;
      return { x: npc.x, y: ai.riseStartY, state: "preMove" };
    }

    return { x: npc.x, y: ai.riseStartY, state: "landing" };
  }

  if (ai.phase2State === "preMove") {
    if (now - ai.phase2StageStart >= PHASE2_PREMOVE_DURATION) {
      ai.phase2State = "laser";
      ai.phase2StageStart = now;
      ctx.playSound?.("laser");
      return { x: npc.x, y: ai.riseStartY, state: "laser" };
    }

    ai.laser = null;
    return { x: npc.x, y: ai.riseStartY, state: "preMove" };
  }

  if (ai.phase2State === "laser") {
    if (now - ai.phase2StageStart >= PHASE2_LASER_DURATION) {
      ai.phase2State = "vulnerable";
      ai.phase2StageStart = now;
      ai.riseStartY = npc.y;
      ai.laser = null;
      ai.appliedDebuff = null;
      return { x: npc.x, y: ai.riseStartY, state: "idle" };
    }

    updateLaser(ai, ctx, now);
    // Mantém a direção fixa durante o laser: não vira para seguir o jogador.
    return { x: npc.x, y: ai.riseStartY, state: "laser", direction: npc.direction };
  }

  if (ai.phase2State === "vulnerable") {
    return handleVulnerable(ai, ctx, now);
  }

  if (ai.phase2State === "debuff") {
    return handleDebuff(ai, ctx, now);
  }

  if (ai.phase2State === "throwPapers") {
    return handleThrowPapers(ai, ctx, now);
  }

  if (ai.phase2State === "charging") {
    return handleCharging(ai, ctx, now);
  }

  if (ai.phase2State === "push") {
    return handlePhase2Push(ai, ctx, now);
  }

  ai.laser = null;
  return { x: npc.x, y: ai.riseStartY, state: "flying" };
}
