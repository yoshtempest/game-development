import { canMoveTo } from "@/gameRules/movement/collision";
import { canStepTo, getTileHeight } from "@/gameRules/movement/levels";
import { THREE_HUNDRED_MS } from "@/data/ms";

export const EXPLORE_MOVE_INTERVAL = THREE_HUNDRED_MS;

export type ExploreMoveResult = {
  player: Player;
  blocked: boolean;
};

export type BlockedTile = { x: number; y: number };

export function isBlockedTile(
  blockedTiles: BlockedTile[] | undefined,
  x: number,
  y: number,
) {
  return blockedTiles?.some((tile) => tile.x === x && tile.y === y) ?? false;
}

function tryMove(
  player: Player,
  map: number[][],
  heightMap: number[][] | undefined,
  direction: Direction,
  step: number,
  blockedTiles?: BlockedTile[],
): { moved: boolean; newX: number; newY: number } {
  let newX = player.gridX;
  let newY = player.gridY;

  if (direction === "up") newY -= step;
  if (direction === "down") newY += step;
  if (direction === "left") newX -= step;
  if (direction === "right") newX += step;

  if (
    !canMoveTo(map, newX, newY) ||
    !canStepTo(player.height, heightMap, newX, newY) ||
    isBlockedTile(blockedTiles, newX, newY)
  ) {
    return { moved: false, newX: player.gridX, newY: player.gridY };
  }

  // when moving multiple tiles, check every intermediate tile too
  if (step > 1) {
    for (let s = 1; s < step; s++) {
      let ix = player.gridX;
      let iy = player.gridY;
      if (direction === "up") iy -= s;
      if (direction === "down") iy += s;
      if (direction === "left") ix -= s;
      if (direction === "right") ix += s;
      if (
        !canMoveTo(map, ix, iy) ||
        !canStepTo(player.height, heightMap, ix, iy) ||
        isBlockedTile(blockedTiles, ix, iy)
      ) {
        return { moved: false, newX: player.gridX, newY: player.gridY };
      }
    }
  }

  return { moved: true, newX, newY };
}

export function moveExplore(
  player: Player,
  map: number[][],
  direction: Direction,
  heightMap?: number[][],
  blockedTiles?: BlockedTile[],
): ExploreMoveResult {
  if (player.mode !== "explore") return { player, blocked: false };
  if (player.emote) player = { ...player, emote: undefined };

  if (player.hasPeru) {
    const double = tryMove(player, map, heightMap, direction, 2, blockedTiles);
    if (double.moved) {
      return {
        player: {
          ...player,
          gridX: double.newX,
          gridY: double.newY,
          height: getTileHeight(heightMap, double.newX, double.newY),
          direction,
          moving: true,
        },
        blocked: false,
      };
    }
    const single = tryMove(player, map, heightMap, direction, 1, blockedTiles);
    if (single.moved) {
      return {
        player: {
          ...player,
          gridX: single.newX,
          gridY: single.newY,
          height: getTileHeight(heightMap, single.newX, single.newY),
          direction,
          moving: true,
        },
        blocked: false,
      };
    }
    return { player: { ...player, direction, moving: false }, blocked: true };
  }

  const result = tryMove(player, map, heightMap, direction, 1, blockedTiles);
  if (result.moved) {
    return {
      player: {
        ...player,
        gridX: result.newX,
        gridY: result.newY,
        height: getTileHeight(heightMap, result.newX, result.newY),
        direction,
        moving: true,
      },
      blocked: false,
    };
  }
  return { player: { ...player, direction, moving: false }, blocked: true };
}
