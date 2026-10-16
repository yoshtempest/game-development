import { LucauaPortalConstants } from "@/data/characters/lucaua/lucaua";

import type {
  LucauaPortal,
  LucauaPortalCross,
  LucauaPortalKind,
} from "@/utils/types/character/lucaua";

/**
 * Direção que um projétil adota ao **sair** de um portal. A boca do portal
 * apoia uma direção: o frontal (`default`) é uma passagem horizontal — quem sai
 * segue em frente, mantendo a direção de entrada; o terrestre abre para cima e
 * o aéreo para baixo, então quem sai deles vira vertical (90°/-90°).
 *
 * Tudo em unidades de arena, onde `y` cresce para baixo — subir é `dirY: -1`.
 */
export function getPortalExitDirection(
  kind: LucauaPortalKind,
  dirX: number,
  dirY: number,
): { dirX: number; dirY: number } {
  if (kind === "ground") return { dirX: 0, dirY: -1 };
  if (kind === "air") return { dirX: 0, dirY: 1 };
  return { dirX, dirY };
}

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
