import { playerSoundPath } from "@/utils/paths/song/playerSoundPath";

export function receiveOrUnlock(path: string) {
  return playerSoundPath(`receiveOrUnlock/${path}`);
}
