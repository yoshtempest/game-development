import { asset } from "@/utils/paths/asset";

/**
 * Sprites das habilidades do SrGuaxinim: `inFight/habilities/<ability>/`.
 *
 * Segue a mesma convenção das `habilities/<ability>/` do marshadow — a Killer
 * Queen vive em `habilities/bitesTheDust/` (idle/touch/palm/prePalm e o
 * `srGuaxinimSeeing`), não em `inFight/special/` (pasta que não existe mais).
 */
export function playerPathSrGuaxinimHabilities(path: string) {
  return asset(`/assets/player/srGuaxinim/inFight/habilities/${path}`);
}
