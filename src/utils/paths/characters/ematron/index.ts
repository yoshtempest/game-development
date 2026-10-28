import { asset } from "@/utils/paths/asset";

/**
 * Sprites das habilidades do Ematron: `inFight/habilities/<ability>/`.
 *
 * As habilidades (chargingKi, teleport, genkiDama, kamehameha) ficam direto sob
 * `inFight/habilities/`, não em `inFight/attacks/` nem em `inFight/default/`.
 */
export function playerPathEmatronHabilities(path: string) {
  // O caller pode passar o caminho com ou sem barra inicial (`/kamehameha/x.svg`);
  // normalizar aqui evita o caminho duplicado (`habilities//kamehameha/...`).
  const cleanPath = path.replace(/^\/+/, "");
  return asset(`/assets/player/ematron/inFight/habilities/${cleanPath}`);
}
