import { useEffect, useRef } from "react";
import { useTransitionCtx } from "@/contexts/Transition/TransitionContext";
import { saveCompressed, loadCompressed } from "@/services/save/storageService";
import { slotKey } from "@/services/save/slotManager";

const SCENE_POSITIONS_KEY = () => slotKey("scene_return_positions");

type Props = {
  player: PlayerPosition & { height?: number };
  transitions?: Transition[];
};

export function useSceneNavigation({ player, transitions }: Props) {
  const { navigateWithFade } = useTransitionCtx();
  const hasNavigatedRef = useRef(false);
  const previousPositionRef = useRef({
    x: player.gridX,
    y: player.gridY,
    direction: player.direction,
    height: player.height,
  });
  const lastPositionRef = useRef({
    x: player.gridX,
    y: player.gridY,
  });

  useEffect(() => {
    const moved =
      player.gridX !== lastPositionRef.current.x ||
      player.gridY !== lastPositionRef.current.y;

    if (!moved) return;

    previousPositionRef.current = {
      x: lastPositionRef.current.x,
      y: lastPositionRef.current.y,
      direction: player.direction,
      height: player.height,
    };

    lastPositionRef.current = {
      x: player.gridX,
      y: player.gridY,
    };
  }, [player]);

  useEffect(() => {
    if (!transitions || hasNavigatedRef.current) return;

    transitions.forEach(({ positions, to }) => {
      const match = positions.some(
        (pos) => pos.x === player.gridX && pos.y === player.gridY,
      );

      if (match) {
        hasNavigatedRef.current = true;

        const currentRoute = window.location.hash.replace(/^#/, "") || "/";
        const stored = loadCompressed<
          Record<string, typeof previousPositionRef.current>
        >(SCENE_POSITIONS_KEY());
        const map: Record<string, typeof previousPositionRef.current> =
          stored ?? {};
        map[currentRoute] = previousPositionRef.current;
        saveCompressed(SCENE_POSITIONS_KEY(), map);

        navigateWithFade(to, {
          state: {
            from: currentRoute,
          },
        });
      }
    });
  }, [player, transitions, navigateWithFade]);
}
