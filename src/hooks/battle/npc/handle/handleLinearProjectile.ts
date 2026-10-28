import { ProjectileConstants, ProjectileHpConstants } from "@/data/projectile";
import {
  shouldCutProjectile,
  createSlicedProjectile,
} from "@/gameRules/npc/projectile/cutProjectile";
import {
  crouchDodgesProjectile,
  getProjectileHitY,
  type ProjectileHeight,
} from "@/gameRules/npc/projectile/crouchDodge";
import { tryMeleeIntercept } from "@/hooks/battle/npc/tryMeleeIntercept";
import type { StrikeOpts } from "@/hooks/battle/npc/apply/applyPlayerStrike";
import type { DamageKind } from "@/utils/types/battle/damageKind";

export type LinearOpts = {
  playerX: number;
  playerY: number;
  playerState: PlayerState;
  playerCharacter?: string;
  playerDirection?: Direction;
  npcClass: NPCClass;
  sphere?: PlayerSpecialProjectile;
  onDestroyed?: () => void;
  claimToken?: StrikeOpts["claimToken"];
  resolveHit?: StrikeOpts["resolveHit"];
  spawnDamage?: StrikeOpts["spawnDamage"];
  onHit: (damageKind?: DamageKind) => void;
  onPullPlayer?: (x: number) => void;
  onMiss?: (x: number) => void;
  onStick?: () => void;
  /** Multiplicador de tempo da entidade (regra `gameRules/battle/tempo`). */
  speedScale?: number;
};

export function handleLinearProjectile(
  p: ProjectileCommon | ProjectilePull,
  opts: LinearOpts,
): ProjectileCommon | ProjectilePull | ProjectileCut | null {
  if (p.state === "walk") {
    if (Date.now() - p.createdAt >= 500) {
      return { ...p, state: "idle" };
    }
    return p;
  }

  const speed = ProjectileConstants.SPEED * (opts.speedScale ?? 1);
  const next = {
    ...p,
    x: p.x + p.dirX * speed,
    y: p.y + p.dirY * speed,
  };

  // Colisão com a esfera do Natsuki em voo: a esfera (indestrutível) aniquila
  // projéteis inimigos no seu caminho.
  if (
    opts.sphere &&
    !next.indestructible &&
    Math.abs(opts.sphere.x - next.x) <=
      ProjectileHpConstants.SPHERE_HIT_RANGE_X &&
    Math.abs(opts.sphere.y - next.y) <= ProjectileHpConstants.SPHERE_HIT_RANGE_Y
  ) {
    opts.onDestroyed?.();
    return null;
  }

  // Golpe do jogador (básico ou special) intercepta o projétil no alcance: o
  // Marshadow divide em duas partes (corte nunca destrói); os demais causam o
  // dano real do ataque.
  const intercepted = tryMeleeIntercept(p, next, opts);
  if (intercepted !== undefined) return intercepted;

  if (
    next.x < -ProjectileConstants.OFFSCREEN_MARGIN ||
    next.x >
      ProjectileConstants.MAP_WIDTH + ProjectileConstants.OFFSCREEN_MARGIN ||
    next.y < -ProjectileConstants.OFFSCREEN_MARGIN ||
    next.y >
      ProjectileConstants.MAP_HEIGHT + ProjectileConstants.OFFSCREEN_MARGIN
  ) {
    if (p.variant === "common" && p.landsOnGround) {
      const landX = Math.max(
        0,
        Math.min(ProjectileConstants.MAP_WIDTH, next.x),
      );
      opts.onMiss?.(landX);
    }
    return null;
  }

  const dx = Math.abs(opts.playerX - next.x);
  const isDashing = opts.playerState === "dash";
  // Elevação do projétil: `common` declara no dado (`canCrouchDodge: false`
  // = terrestre, ex: papel em chamas do Maugrelo), `pull` é aéreo.
  const height: ProjectileHeight =
    p.variant === "common" && p.canCrouchDodge === false ? "ground" : "air";
  const dodgeProjectile =
    isDashing || crouchDodgesProjectile(opts.playerState, height);

  const hitY = getProjectileHitY(opts.playerY, opts.playerState, height);
  const hitDy = Math.abs(hitY - next.y);

  if (dx < 40 && hitDy <= 160 && !dodgeProjectile) {
    const cut = shouldCutProjectile({
      projectile: next,
      playerX: opts.playerX,
      playerY: opts.playerY,
      playerState: opts.playerState,
      playerCharacter: opts.playerCharacter ?? "",
      playerDirection: opts.playerDirection ?? "left",
      npcClass: opts.npcClass,
    });
    if (cut) {
      return createSlicedProjectile(next, next.x, next.y);
    }

    if (p.variant === "pull") {
      opts.onPullPlayer?.(p.pullTargetX);
    }
    if (p.variant === "common" && p.landsOnGround) {
      opts.onStick?.();
    } else {
      opts.onHit(p.damageType);
    }
    return null;
  }

  return next;
}
