import { asset } from "@/utils/paths/asset";

export function playerPathLaricellHabilities(path: string) {
  const cleanPath = path.replace(/^\/+/, "");
  return asset(`/assets/player/laricell/inFight/habilities/${cleanPath}`);
}