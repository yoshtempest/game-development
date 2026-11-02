import type { Props } from "./types";
import { useLayoutEffect, useState } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import type { ScenePosition } from "@/utils/types/sceneHooks";
import { saveCompressed, loadCompressed } from "@/services/save/storageService";
import { slotKey } from "@/services/save/slotManager";
import { getTileHeight } from "@/gameRules/movement/levels";

const SCENE_POSITIONS_KEY = () => slotKey("scene_return_positions");

export function useSceneSetup({
  map,
  heightMap,
  initialPosition,
  setMap,
  setHeightMap,
  setPosition,
}: Props) {
  const [isReady, setIsReady] = useState(false);
  const setMapRef = useLatestRef(setMap);
  const setHeightMapRef = useLatestRef(setHeightMap);
  const setPositionRef = useLatestRef(setPosition);
  const initialPositionRef = useLatestRef(initialPosition);
  const heightMapRef = useLatestRef(heightMap);

  useLayoutEffect(() => {
    setMapRef.current(map);
    if (heightMapRef.current) setHeightMapRef.current(heightMapRef.current);

    localStorage.removeItem("scene_return_position");

    const currentRoute = window.location.hash.replace(/^#/, "") || "/";
    const positions =
      loadCompressed<Record<string, ScenePosition>>(SCENE_POSITIONS_KEY()) ??
      {};

    const saved = positions[currentRoute];

    if (saved) {
      setPositionRef.current(
        saved.x,
        saved.y,
        saved.direction,
        getTileHeight(heightMapRef.current, saved.x, saved.y),
      );
      delete positions[currentRoute];
      saveCompressed(SCENE_POSITIONS_KEY(), positions);
      setIsReady(true);
      return;
    }

    const pos = initialPositionRef.current;

    if (pos) {
      setPositionRef.current(
        pos.x,
        pos.y,
        pos.direction,
        pos.height ?? getTileHeight(heightMapRef.current, pos.x, pos.y),
      );
    }

    setIsReady(true);
  }, [
    map,
    heightMapRef,
    initialPositionRef,
    setHeightMapRef,
    setMapRef,
    setPositionRef,
  ]);

  return { isReady };
}
