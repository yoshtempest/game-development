import { isPlayerInRange } from "@/gameRules/battle/range";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import {
  shouldCutProjectile,
  createSlicedProjectile,
  MARSHADOW_CHARACTER_ID,
} from "@/gameRules/npc/projectile/cutProjectile";
import { getProjectileDamagePoint } from "@/gameRules/npc/projectile/projectileDamage";
import type { LinearOpts } from "./handle/handleLinearProjectile";
import { applyPlayerStrike } from "./apply/applyPlayerStrike";

/**
 * Interceptação pelo golpe do jogador (projéteis common/pull).
 *
 * - Marshadow: a corte passiva desvia o projétil dividindo em 2 — nunca o
 *   destrói. Projéteis indestrutíveis não podem ser cortados.
 * - Demais personagens: o golpe (básico ou special) causa o dano real do
 *   ataque, destruindo o projétil ao zerar o HP.
 *
 * Retorna null (destruído), um projétil cortado, ou undefined (segue sem
 * interceptação).
 */
export function tryMeleeIntercept(
  p: ProjectileCommon | ProjectilePull,
  next: ProjectileCommon | ProjectilePull,
  opts: LinearOpts,
): ProjectileCommon | ProjectilePull | ProjectileCut | null | undefined {
  if (p.indestructible) return undefined;
  if (!ALL_PREDICATES.isStrike(opts.playerState)) return undefined;

  const isSpecial = ALL_PREDICATES.isAbilityStrike(opts.playerState);
  const inRange = isPlayerInRange(
    opts.playerX,
    opts.playerY,
    next.x,
    next.y,
    opts.playerState,
    opts.playerCharacter ?? "",
    isSpecial,
    false,
    opts.npcClass,
  );
  if (!inRange) return undefined;

  const isMarshadow = opts.playerCharacter === MARSHADOW_CHARACTER_ID;
  if (isMarshadow && !isSpecial) {
    const cut = shouldCutProjectile({
      projectile: next,
      playerX: opts.playerX,
      playerY: opts.playerY,
      playerState: opts.playerState,
      playerCharacter: opts.playerCharacter ?? "",
      playerDirection: opts.playerDirection ?? "left",
      npcClass: opts.npcClass,
    });
    if (cut) return createSlicedProjectile(next, next.x, next.y);
    return undefined;
  }

  const struck = applyPlayerStrike(next, {
    playerState: opts.playerState,
    claimToken: opts.claimToken,
    resolveHit: opts.resolveHit,
    spawnDamage: opts.spawnDamage,
    point: getProjectileDamagePoint(next),
    onDestroyed: opts.onDestroyed,
  });
  return struck.hit ? struck.projectile : undefined;
}
