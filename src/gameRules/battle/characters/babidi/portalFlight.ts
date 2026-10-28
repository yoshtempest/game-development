import { BabidiPortalConstants } from "@/data/characters/babidi";
import type { BabidiPortal } from "@/utils/types/character/babidi";

/** Portal em voo da mão até o destino, se houver algum na lista. */
export function findFlyingPortal(
  portals: readonly BabidiPortal[],
): BabidiPortal | null {
  return portals.find((portal) => portal.phase === "flying") ?? null;
}

/**
 * Avança o voo de um portal por um tick (interpolação absoluta pelo tempo
 * decorrido) ou devolve o portal como está se já estiver fincado.
 *
 * Função pura: devolve um portal novo. O alvo absoluto (`startTime`) é o que
 * permite a interpolação ser independente da taxa do tick — travar/destravar a
 * aba no meio do voo não "acelera" o portal.
 */
export function advancePortalFlight(
  portal: BabidiPortal,
  now: number,
): BabidiPortal {
  if (portal.phase !== "flying") return portal;

  const t = Math.min(
    (now - portal.startTime) / BabidiPortalConstants.FLIGHT_MS,
    1,
  );
  if (t >= 1) {
    return { ...portal, x: portal.targetX, y: portal.targetY, phase: "placed" };
  }

  // Ease-out cúbico: sai rápido da mão e desacelera até encaixar no destino.
  const eased = 1 - Math.pow(1 - t, 3);
  return {
    ...portal,
    x: portal.startX + (portal.targetX - portal.startX) * eased,
    y: portal.startY + (portal.targetY - portal.startY) * eased,
  };
}
