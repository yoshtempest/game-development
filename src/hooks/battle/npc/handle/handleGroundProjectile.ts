import { ProjectileConstants, ProjectileHpConstants } from "@/data/projectile";
import { isPlayerInRange } from "@/gameRules/battle/range";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import { getProjectileDamagePoint } from "@/gameRules/npc/projectile/projectileDamage";
import { applyPlayerStrike } from "@/hooks/battle/npc/apply/applyPlayerStrike";
import type { StrikeOpts } from "@/hooks/battle/npc/apply/applyPlayerStrike";
import type { DamageKind } from "@/utils/types/battle/damageKind";

/**
 * Projétil terrestre: viaja na horizontal, rente ao chão, até a ponta do mapa.
 *
 * O `variant` já declara a elevação, então este handler não reimplementa a
 * regra do agachamento: o projétil rasteja na altura em que a hitbox abaixada
 * do jogador continua exposta, e quem desvia é o dash (i-frame para tudo).
 *
 * O impacto tem dois desfechos, escolhidos pelo dado `detonatesOnHit`:
 * detonando, vira explosão (dano de impacto + push, via `onBurstHit`) e fica
 * no sprite de estrago até `GROUND_IMPACT_MS`; sem ele, é dano direto de
 * projétil e some na hora.
 */
export function handleGroundProjectile(
  p: ProjectileGround,
  opts: {
    playerX: number;
    playerY: number;
    playerState: PlayerState;
    playerCharacter?: string;
    npcClass: NPCClass;
    sphere?: PlayerSpecialProjectile;
    onDestroyed?: () => void;
    claimToken?: StrikeOpts["claimToken"];
    resolveHit?: StrikeOpts["resolveHit"];
    spawnDamage?: StrikeOpts["spawnDamage"];
    onHit: (damageKind?: DamageKind) => void;
    onBurstHit: ((pushDir: number) => void) | undefined;
    /** Multiplicador de tempo da entidade (regra `gameRules/battle/tempo`). */
    speedScale?: number;
  },
): ProjectileGround | null {
  if (p.impacted) {
    if (
      Date.now() - (p.impactedAt ?? p.createdAt) >=
      ProjectileConstants.GROUND_IMPACT_MS
    ) {
      return null;
    }
    return p;
  }

  const next = {
    ...p,
    x: p.x + p.dirX * ProjectileConstants.GROUND_SPEED * (opts.speedScale ?? 1),
  };

  // Colisão com a esfera do Natsuki em voo.
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

  // Golpe do jogador (básico ou special): destrutível pelo dano real do ataque
  // (corte não se aplica).
  if (!next.indestructible && ALL_PREDICATES.isStrike(opts.playerState)) {
    const inRange = isPlayerInRange(
      opts.playerX,
      opts.playerY,
      next.x,
      next.y,
      opts.playerState,
      opts.playerCharacter ?? "",
      ALL_PREDICATES.isAbilityStrike(opts.playerState),
      false,
      opts.npcClass,
    );
    if (inRange) {
      const struck = applyPlayerStrike(next, {
        playerState: opts.playerState,
        claimToken: opts.claimToken,
        resolveHit: opts.resolveHit,
        spawnDamage: opts.spawnDamage,
        point: getProjectileDamagePoint(next),
        onDestroyed: opts.onDestroyed,
      });
      // Golpe já gasto neste ataque (ou sem dano): o projétil segue o trajeto
      // normal, sem número e sem perder HP.
      if (struck.hit) return struck.projectile;
    }
  }

  if (
    next.x < -ProjectileConstants.OFFSCREEN_MARGIN ||
    next.x >
      ProjectileConstants.MAP_WIDTH + ProjectileConstants.OFFSCREEN_MARGIN
  ) {
    return null;
  }

  // ── Colisão com o jogador ────────────────────────────────────────────────
  // Terrestre: a hitbox abaixada pelo agachamento não ajuda, porque o projétil
  // está na altura do chão. Só o dash escapa.
  if (opts.playerState === "dash") return next;

  const dx = Math.abs(opts.playerX - next.x);
  const dy = Math.abs(opts.playerY - next.y);

  if (
    dx < ProjectileConstants.GROUND_HIT_RANGE_X &&
    dy <= ProjectileConstants.GROUND_HIT_RANGE_Y
  ) {
    if (!p.detonatesOnHit) {
      opts.onHit(p.damageType);
      return null;
    }
    opts.onBurstHit?.(p.dirX);
    return {
      ...next,
      impacted: true,
      impactedAt: Date.now(),
      sprite: p.impactSprite ?? p.sprite,
    };
  }

  return next;
}
