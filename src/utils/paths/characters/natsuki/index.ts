import { asset } from "@/utils/paths/asset";

/**
 * Sprites das habilidades do natsuki: `inFight/habilities/<ability>/`.
 *
 * Mesma convenção do srGuaxinim — as habilidades ficam direto sob `inFight/
 * habilities/`, e não em `inFight/default/habilities/` como as do marshadow. A
 * sequência de Setup das esferas vive em `habilities/Setup/` (one/two/three).
 */
export function playerPathNatsukiHabilities(path: string) {
  return asset(`/assets/player/natsuki/inFight/habilities/${path}`);
}
