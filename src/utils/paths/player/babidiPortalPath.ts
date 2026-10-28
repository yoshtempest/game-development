import { playerAbilityPath } from "./playerAbilityBackgroundPath";

import type { BabidiPortalKind } from "@/utils/types/character/babidi";

const PORTAL_FILE: Record<BabidiPortalKind, string> = {
  ground: "groundPortal.svg",
  default: "defaultPortal.svg",
  air: "airPortal.svg",
};

/**
 * Sprite do portal do babidi pelo tipo: `ground` (deitado no chão),
 * `default` (em pé) ou `air` (suspenso). Vive em
 * `assets/player/babidi/inFight/habilities/portals/`.
 */
export function babidiPortalPath(kind: BabidiPortalKind): string {
  return playerAbilityPath("babidi", "portals", PORTAL_FILE[kind]);
}
