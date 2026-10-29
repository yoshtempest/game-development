import { BATTLE_LIMITS } from "@/gameRules/movement/constants";
import type { BehaviorContext } from "@/utils/types/npc/npcBehavior";
import type { MaugreloAI } from "@/services/npc/attacks/maugrelo/state";
import {
  LASER_DAMAGE_INTERVAL,
  LASER_BODY_OFFSET,
} from "@/services/npc/attacks/maugrelo/state";
import { isPlayerProtected } from "./isPlayerProtected";

export function updateLaser(
  ai: MaugreloAI,
  ctx: BehaviorContext,
  now: number,
): void {
  const { npc, playerX, playerState } = ctx;
  const fromX = npc.x;
  const fromY = ai.riseStartY - LASER_BODY_OFFSET;
  const facingRight = npc.direction === "right";

  const inFront = facingRight ? playerX >= fromX : playerX <= fromX;
  const protectedByPlayer = isPlayerProtected(playerState);
  const stopsAtPlayer = inFront && !protectedByPlayer;
  const toX = facingRight
    ? stopsAtPlayer
      ? playerX
      : BATTLE_LIMITS.maxX
    : stopsAtPlayer
      ? playerX
      : BATTLE_LIMITS.minX;

  ai.laser = {
    active: true,
    fromX,
    fromY,
    toX,
    toY: fromY,
    dirX: facingRight ? 1 : -1,
  };

  if (!inFront) return;
  if (protectedByPlayer) return;
  if (now - ai.lastLaserDamage < LASER_DAMAGE_INTERVAL) return;

  ai.lastLaserDamage = now;
  ctx.onLaserHit?.(npc.x);
}
