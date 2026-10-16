import { playerAbilityPath } from "./playerAbilityBackgroundPath";

import type { LucauaPortalKind } from "@/utils/types/character/lucaua/lucaua";

const PORTAL_FILE: Record<LucauaPortalKind, string> = {
  ground: "groundPortal.svg",
  default: "defaultPortal.svg",
  air: "airPortal.svg",
};

/**
 * Sprite do portal do lucaua pelo tipo: `ground` (deitado no chão),
 * `default` (em pé) ou `air` (suspenso). Vive em
 * `assets/player/lucaua/inFight/habilities/portals/`.
 */
export function lucauaPortalPath(kind: LucauaPortalKind): string {
  return playerAbilityPath("lucaua", "portals", PORTAL_FILE[kind]);
}
