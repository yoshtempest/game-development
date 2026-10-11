import {
  SIXTEEN_MS,
  THIRTY_MS,
  FIFTY_MS,
  THREE_HUNDRED_MS,
  FIVE_HUNDRED_MS,
  TWENTY_THOUSAND_MS,
} from "@/data/ms";
import type { KillerQueenOverlay } from "@/utils/types/character/srGuaxinim";

export const PUNCH_LIFETIME_MS = FIVE_HUNDRED_MS;
export const PUNCH_SPAWN_INTERVAL_MS = THIRTY_MS;
export const PUNCH_FINALIZE_MS = THREE_HUNDRED_MS;
export const PUNCH_MOVE_TICK_MS = SIXTEEN_MS;
export const PUNCH_MOVE_FACTOR = 0.22;
export const PUNCH_TARGET_JITTER = 60;
export const PUNCH_MIN_DISTANCE_MS = FIFTY_MS;

export const SPAWN_X_OFFSET = 55;
export const BEHIND_X_OFFSET = 45;
export const TOTAL_FREEZE_MS = 10000;
/** Cooldown do botão da Killer Queen (o antigo cooldown do special). */
export const KILLER_QUEEN_COOLDOWN_MS = TWENTY_THOUSAND_MS;
/** Id do efeito de tempo da Killer Queen (regra `gameRules/battle/tempo`). */
export const KILLER_QUEEN_TIME_ID = "artur:killerQueen";

export const DEFAULT_OVERLAY: KillerQueenOverlay = {
  active: false,
  x: 0,
  y: 0,
  sprite: "idle",
  opacity: 0,
  flip: false,
};

export const KILLER_QUEEN_SPRITE_FILE: Record<
  KillerQueenOverlay["sprite"],
  string
> = {
  idle: "killerQueenIdle",
  touch: "touch",
  prePalm: "prePalm",
  palm: "palm",
};
