import type { PortalWarp } from "@/utils/types/character/lucaua/portals";
import type { LucauaPortal } from "@/utils/types/character/lucaua";
import { LucauaPortalConstants } from "@/data/characters/lucaua";
import { overlapsPortal } from "./portalGeometry";

export type PickWarpResult =
  | { kind: "none" }
  | { kind: "disarm" }
  | { kind: "arm"; warp: PortalWarp };

/**
 * Decide a travessia de uma entidade.
 *
 * Função pura: não modifica estado externo. O chamador é responsável por aplicar
 * os efeitos (adicionar/remover do `disarmed`).
 */
export function pickWarpDecision(
  id: string,
  x: number,
  feetY: number,
  portals: LucauaPortal[],
  disarmed: Set<string>,
): PickWarpResult {
  if (portals.length < LucauaPortalConstants.MAX_PORTALS) {
    return { kind: "none" };
  }

  const a = portals[0];
  const b = portals[1];
  if (!a || !b) return { kind: "none" };
  if (a.phase !== "placed" || b.phase !== "placed") return { kind: "none" };

  const inA = overlapsPortal(x, feetY, a);
  const inB = overlapsPortal(x, feetY, b);

  if (!inA && !inB) {
    return { kind: "disarm" };
  }

  if (disarmed.has(id)) {
    return { kind: "none" };
  }

  const warp: PortalWarp = inA ? { dest: b, source: a } : { dest: a, source: b };
  return { kind: "arm", warp };
}