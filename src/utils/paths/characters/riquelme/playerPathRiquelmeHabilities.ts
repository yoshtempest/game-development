import { asset } from "@/utils/paths/asset";

/**
 * Sprites das habilidades do riquelme: `inFight/habilities/<ability>/`.
 *
 * Mesma convenção do artur — as habilidades ficam direto sob `inFight/
 * habilities/`, e não em `inFight/default/habilities/` como as do marcelo. A
 * sequência de Setup das esferas vive em `habilities/Setup/` (one/two/three).
 */
export function playerPathRiquelmeHabilities(path: string) {
  return asset(`/assets/player/riquelme/inFight/habilities/${path}`);
}
