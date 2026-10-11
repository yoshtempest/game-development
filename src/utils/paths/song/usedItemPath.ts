import { playerSoundPath } from "./playerSoundPath";

export function usedItemPath(path: string) {
  return playerSoundPath(`useItem/${path}`);
}
