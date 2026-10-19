import { playerSoundPath } from "@/utils/paths/song/playerSoundPath";

export function charactersSoundPath(path: string) {
  return playerSoundPath(`characters/${path}`);
}
