import { LucauaPortalConstants } from "@/data/characters/lucaua/lucaua";

import type {
  LucauaPortal,
  LucauaPortalCross,
} from "@/utils/types/character/lucaua";

/**
 * Travessia visual em andamento (a entidade está afundando num portal
 * terrestre), para o render dividir o sprite entre os dois portais.
 *
 * Só o portal **terrestre** tem essa entrada gradual (o corpo cai
 * `GROUND_FALL_DEPTH` antes de cruzar); os suspensos teleportam na hora, sem
 * pedaço nenhum "dentro" para mostrar no par.
 *
 * O `depth` sai da própria posição da entidade — a gravidade (player) e as
 * quedas simuladas (NPC/summons/aliados) já escrevem o `y` a cada tick, então
 * nada precisa ser passado do hook para o render além dos portais.
 */
export function getPortalCross(
  portals: LucauaPortal[],
  x: number,
  feetY: number,
): LucauaPortalCross | null {
  if (portals.length < LucauaPortalConstants.MAX_PORTALS) return null;

  let sourceIndex = -1;
  let depth = 0;

  for (let i = 0; i < portals.length; i++) {
    const portal = portals[i];
    if (!portal || portal.phase !== "placed" || portal.kind !== "ground") {
      continue;
    }
    if (Math.abs(x - portal.x) > LucauaPortalConstants.TRIGGER_HALF_X) continue;
    const below = feetY - portal.y;
    if (below <= depth) continue;
    sourceIndex = i;
    depth = below;
  }

  if (sourceIndex < 0) return null;

  const source = portals[sourceIndex];
  const dest = portals[sourceIndex === 0 ? 1 : 0];
  if (!source || !dest || dest.phase !== "placed") return null;

  return { depth, destX: dest.x, destY: dest.y };
}
