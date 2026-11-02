import type { Dispatch, SetStateAction } from "react";

type AutoWalkTarget = { x: number; y: number };

export type AutoWalkProps = {
  active: boolean;
  target: AutoWalkTarget;
  player: Player;
  setPlayer: Dispatch<SetStateAction<Player>>;
  map: number[][];
  heightMap?: number[][];
  onArrived?: () => void;
};
