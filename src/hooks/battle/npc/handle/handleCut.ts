import { ProjectileHpConstants } from "@/data/projectile";
import { updateSlicedProjectile } from "@/gameRules/npc/projectile/cutProjectile";

/**
 * Fragmentos cortados pelo Marshadow avançam até saírem da tela. Quando um
 * fragmento (que voltou ao NPC em cenário espelhado) chega perto dele, o NPC
 * o destrói — a corte desvia, mas o alvo pode aniquilar o que retorna.
 */
export function handleCut(
  p: ProjectileCut,
  opts: { npcX: number; npcY: number; onDestroyed?: () => void },
): ProjectileCut | null {
  const next = updateSlicedProjectile(p);
  if (!next) return null;

  const nearNpc =
    Math.hypot(next.upper.x - opts.npcX, next.upper.y - opts.npcY) <=
      ProjectileHpConstants.CUT_FRAGMENT_DESTROY_RADIUS ||
    Math.hypot(next.lower.x - opts.npcX, next.lower.y - opts.npcY) <=
      ProjectileHpConstants.CUT_FRAGMENT_DESTROY_RADIUS;
  if (nearNpc) {
    opts.onDestroyed?.();
    return null;
  }
  return next;
}
