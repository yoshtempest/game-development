import {
  CHARACTER_RANGE_X,
  NPC_CLASS_HITBOX_BONUS,
  NPC_CLASS_VERTICAL_BONUS,
} from "./config";

export function isPlayerInRange(
  playerX: number,
  playerY: number,
  npcX: number,
  npcY: number,
  playerState: PlayerState,
  character: string,
  isSpecial: boolean,
  isBlock = false,
  npcClass: NPCClass = "common",
  rangeOverride?: number,
) {
  if (
    !isBlock &&
    ((!isSpecial && playerState === "jump") || playerState === "blocked")
  ) {
    return false;
  }

  const ranges = CHARACTER_RANGE_X[character];

  if (!ranges) return false;

  const rangeX =
    (rangeOverride ??
      (isSpecial
        ? ranges.specialHitRange
        : isBlock
          ? ranges.blockHitRange
          : ranges.normalHitRange)) + (NPC_CLASS_HITBOX_BONUS[npcClass] ?? 0);

  const dx = Math.abs(playerX - npcX);
  const dy = Math.abs(playerY - npcY);

  const verticalRange = 150 + (NPC_CLASS_VERTICAL_BONUS[npcClass] ?? 0);

  return dx <= rangeX && dy <= verticalRange;
}

export function isNpcInRange(
  playerX: number,
  playerY: number,
  npcX: number,
  npcY: number,
) {
  const dx = Math.abs(playerX - npcX);
  const dy = Math.abs(playerY - npcY);

  return dx <= 50 && dy <= 150;
}
