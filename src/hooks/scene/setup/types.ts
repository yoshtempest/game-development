import type { ScenePosition } from "@/utils/types/sceneHooks";

export type Props = {
  map: number[][];
  heightMap?: number[][];
  initialPosition?: ScenePosition;
  setMap: (map: number[][]) => void;
  setHeightMap: (heightMap: number[][]) => void;
  setPosition: (
    x: number,
    y: number,
    direction: ScenePosition["direction"],
    height?: number,
  ) => void;
};
