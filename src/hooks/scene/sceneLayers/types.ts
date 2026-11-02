import type { ItemPickupTile } from "@/utils/types/maps/exploreScene";

type Player = {
  gridX: number;
  gridY: number;
  height: number;
  direction: Direction;
};

type MapData = number[][];

export type Params = {
  player: Player;
  map: MapData;
  heightMap?: MapData;
  isReady: boolean;
  npcs: { gridX: number; gridY: number }[];
  itemPickupTiles?: ItemPickupTile[];
  plates: { gridX: number; gridY: number; message?: string }[];
  interactionKeys?: string[];
  interactionLabels?: Record<string, string>;
  tileDialogues?: Record<string, unknown>;
  tombstones?: { x: number; y: number }[];
  groundLoots?: { x: number; y: number }[];
};
