import { asset } from "@/utils/paths/asset";

/**
 * Sprites das habilidades do Emanuel: `inFight/habilities/<ability>/`.
 *
 * As habilidades (chargingKi, teleport, genkiDama, kamehameha) ficam direto sob
 * `inFight/habilities/`, não em `inFight/attacks/` nem em `inFight/default/`.
 */
export function playerPathEmanuelHabilities(path: string) {
  return asset(`/assets/player/emanuel/inFight/habilities/${path}`);
}