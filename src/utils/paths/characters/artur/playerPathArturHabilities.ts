import { asset } from "@/utils/paths/asset";

/**
 * Sprites das habilidades do Artur: `inFight/habilities/<ability>/`.
 *
 * Segue a mesma convenção das `habilities/<ability>/` do marcelo — a Killer
 * Queen vive em `habilities/bitesTheDust/` (idle/touch/palm/prePalm e o
 * `arturSeeing`), não em `inFight/special/` (pasta que não existe mais).
 */
export function playerPathArturHabilities(path: string) {
  return asset(`/assets/player/artur/inFight/habilities/${path}`);
}
