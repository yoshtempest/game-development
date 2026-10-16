import { NPC_CLASS_VERTICAL_BONUS } from "@/gameRules/battle/range/config";

export function isFacingTarget(
  playerX: number,
  playerY: number,
  npcX: number,
  npcY: number,
  direction: Direction,
  npcClass: NPCClass = "common",
  dyToleranceOverride?: number,
) {
  const dx = npcX - playerX;
  const dy = npcY - playerY;

  const dyTolerance =
    dyToleranceOverride ?? 50 + (NPC_CLASS_VERTICAL_BONUS[npcClass] ?? 0);

  switch (direction) {
    case "right":
      return dx > 0 && Math.abs(dy) <= dyTolerance;

    case "left":
      return dx < 0 && Math.abs(dy) <= dyTolerance;

    case "up":
      return dy < 0 && Math.abs(dx) <= 50;

    case "down":
      return dy > 0 && Math.abs(dx) <= 50;

    default:
      return false;
  }
}
