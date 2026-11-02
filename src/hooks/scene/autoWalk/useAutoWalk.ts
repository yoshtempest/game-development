import type { AutoWalkProps } from "./types";
import { useEffect } from "react";
import {
  EXPLORE_MOVE_INTERVAL,
  moveExplore,
} from "@/gameRules/movement/explore";
import { useLatestRef } from "@/hooks/useLatestRef";

/**
 * Move o player sozinho, um tile por vez, até alcançar `target`.
 * Usa `moveExplore` (mesma regra de colisão/altura da exploração) e para
 * se chegar ao destino, se encontrar bloqueio ou se desmontar a cena.
 */
export function useAutoWalk({
  active,
  target,
  player,
  setPlayer,
  map,
  heightMap,
  onArrived,
}: AutoWalkProps) {
  const playerRef = useLatestRef(player);
  const mapRef = useLatestRef(map);
  const heightMapRef = useLatestRef(heightMap);
  const targetRef = useLatestRef(target);
  const onArrivedRef = useLatestRef(onArrived);

  useEffect(() => {
    if (!active) return;

    const intervalId = setInterval(() => {
      const current = playerRef.current;
      const goal = targetRef.current;

      if (current.gridX === goal.x && current.gridY === goal.y) {
        clearInterval(intervalId);
        onArrivedRef.current?.();
        return;
      }

      const direction: Direction =
        current.gridY > goal.y
          ? "up"
          : current.gridY < goal.y
            ? "down"
            : current.gridX > goal.x
              ? "left"
              : "right";

      const result = moveExplore(
        current,
        mapRef.current,
        direction,
        heightMapRef.current,
      );
      setPlayer(result.player);

      if (result.blocked) {
        clearInterval(intervalId);
        onArrivedRef.current?.();
      }
    }, EXPLORE_MOVE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [
    active,
    setPlayer,
    playerRef,
    mapRef,
    heightMapRef,
    targetRef,
    onArrivedRef,
  ]);
}
