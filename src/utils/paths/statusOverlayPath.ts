import { effectsPath } from "./effectsPath";

import type { PlayerStatus } from "@/utils/types/battle/status";

/**
 * Caminho de uma imagem de overlay de status
 * (`public/assets/effects/status/<status>/<file>`).
 */
export function statusOverlayPath(status: PlayerStatus, file: string): string {
  return effectsPath(`status/${status}/${file}`);
}
