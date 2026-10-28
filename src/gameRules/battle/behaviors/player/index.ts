import { normalBehavior } from "./normal";
import { laricellBehavior } from "./laricell";
import type { BattleBehavior } from "@/utils/types/player/behavior";

export const battleBehaviors: Record<string, BattleBehavior> = {
  laricell: laricellBehavior,
  default: normalBehavior,
};
