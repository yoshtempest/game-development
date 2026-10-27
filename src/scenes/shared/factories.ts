import type { NpcSizeResolver } from "@/utils/types/maps/exploreScene";
import type { DialogueSystem } from "@/utils/types/sceneHooks";

type ConditionalTileOptions = {
  blockedMessage?: string;
};

export type NpcCreateOptions = {
  size?: number | NpcSizeResolver;
  interaction?: (dialogueSystem: DialogueSystem) => void;
  className?: string;
  hidden?: boolean;
  id?: string;
  flipX?: boolean;
  moveMs?: number;
};

export const createDoorTile = (x: number, y: number, route: string) => ({
  x,
  y,
  route,
});

import type { TileRouteFunction } from "./types";

export const createConditionalTile = (
  x: number,
  y: number,
  getRoute: TileRouteFunction,
  options?: ConditionalTileOptions,
) => ({
  x,
  y,
  getRoute,
  blockedMessage: options?.blockedMessage,
});

export const createNpc = (
  src: string | NpcSrcResolver,
  gridX: number,
  gridY: number,
  sizeOrOptions?: number | NpcCreateOptions | NpcSizeResolver,
): SceneNPCData => {
  const result: SceneNPCData = {
    src,
    gridX,
    gridY,
  };

  // Handle legacy size parameter (number or NpcSizeResolver)
  if (typeof sizeOrOptions === "number" || typeof sizeOrOptions === "function") {
    result.size = sizeOrOptions;
  }
  // Handle new options object
  else if (sizeOrOptions && typeof sizeOrOptions === "object") {
    const options = sizeOrOptions;
    if (options.size !== undefined) result.size = options.size;
    if (options.interaction !== undefined) result.interaction = options.interaction;
    if (options.className !== undefined) result.className = options.className;
    if (options.hidden !== undefined) result.hidden = options.hidden;
    if (options.id !== undefined) result.id = options.id;
    if (options.flipX !== undefined) result.flipX = options.flipX;
    if (options.moveMs !== undefined) result.moveMs = options.moveMs;
  }

  return result;
};

export const createPlate = (
  src: string,
  gridX: number,
  gridY: number,
  message?: string,
) => ({
  src,
  gridX,
  gridY,
  ...(message ? { message } : {}),
});

export const createPosition = (
  x: number,
  y: number,
  direction: Direction,
): ExplorePosition => ({
  x,
  y,
  direction,
});

export const createGiveQuestEvent = (questId: string) => ({
  type: "giveQuest",
  questId,
});
