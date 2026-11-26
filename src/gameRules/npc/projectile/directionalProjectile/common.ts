import { ProjectileHpConstants } from "@/data/projectile";

import { nextProjectileId } from "@/gameRules/npc/projectile/projectileId";
import type { CommonParams } from "./types";

export function createCommonProjectile({
  startX,
  startY,
  targetX,
  targetY,
  sprite,
  state = "walk",
  canCrouchDodge = true,
  landsOnGround = false,
  hp = ProjectileHpConstants.DEFAULT_HP,
  maxHp = hp,
  indestructible = false,
  damageType,
  onHitStatus,
}: CommonParams): ProjectileCommon {
  const dx = targetX - startX;
  const dy = targetY - startY;
  const length = Math.hypot(dx, dy) || 1;

  return {
    variant: "common",
    id: nextProjectileId(),
    x: startX,
    y: startY,
    startX,
    startY,
    dirX: dx / length,
    dirY: dy / length,
    sprite,
    createdAt: Date.now(),
    state,
    canCrouchDodge,
    landsOnGround,
    hp,
    maxHp,
    indestructible,
    damageType,
    onHitStatus,
  };
}
