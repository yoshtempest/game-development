import { useEffect, useRef } from "react";
import { MoveUp, MoveDown, MoveLeft, MoveRight } from "lucide-react";

import styles from "./styles.module.css";
import type { GameControlLayer } from "@/utils/types/player/controls";
import { useCombatTutorial } from "@/contexts/CombatTutorialContext";

type Props = {
  activeControls: GameControlLayer;
  pressed: Set<string>;
  onPressDir?: (dir: Direction) => void;
  onReleaseDir?: (dir: Direction) => void;
};

export function ButtonsMovement({
  activeControls,
  pressed,
  onPressDir,
  onReleaseDir,
}: Props) {
  const { highlightedControl } = useCombatTutorial();
  const holdRef = useRef<NodeJS.Timeout | null>(null);
  const heldDir = useRef<Direction | null>(null);

  useEffect(() => {
    return () => {
      if (holdRef.current) {
        clearInterval(holdRef.current);
        holdRef.current = null;
      }
    };
  }, []);

  function startHold(dir: Direction, fn?: () => void) {
    onPressDir?.(dir);
    heldDir.current = dir;
    fn?.();
    holdRef.current = setInterval(() => {
      fn?.();
    }, 120);
  }

  function stopHold(dir: Direction, releaseFn?: () => void) {
    if (holdRef.current) {
      clearInterval(holdRef.current);
      holdRef.current = null;
    }
    onReleaseDir?.(dir);
    heldDir.current = null;
    releaseFn?.();
  }

  function btnClass(dir: string) {
    return `${styles[dir as keyof typeof styles]} ${pressed.has(dir) ? styles.pressed : ""}`;
  }

  return (
    <div className={styles.movement}>
      <button
        className={btnClass("up")}
        style={
          highlightedControl === "up"
            ? { border: "3px solid white" }
            : undefined
        }
        onPointerDown={() => startHold("up", activeControls?.onUp)}
        onPointerUp={() => stopHold("up", activeControls?.onUpRelease)}
        onPointerLeave={() => stopHold("up", activeControls?.onUpRelease)}
      >
        <MoveUp size={22} />
      </button>

      <button
        className={btnClass("left")}
        style={
          highlightedControl === "left"
            ? { border: "3px solid white" }
            : undefined
        }
        onPointerDown={() => startHold("left", activeControls?.onLeft)}
        onPointerUp={() => stopHold("left", activeControls?.onLeftRelease)}
        onPointerLeave={() => stopHold("left", activeControls?.onLeftRelease)}
      >
        <MoveLeft size={22} />
      </button>

      <button
        className={btnClass("right")}
        style={
          highlightedControl === "right"
            ? { border: "3px solid white" }
            : undefined
        }
        onPointerDown={() => startHold("right", activeControls?.onRight)}
        onPointerUp={() => stopHold("right", activeControls?.onRightRelease)}
        onPointerLeave={() => stopHold("right", activeControls?.onRightRelease)}
      >
        <MoveRight size={22} />
      </button>

      <button
        className={btnClass("down")}
        style={
          highlightedControl === "down"
            ? { border: "3px solid white" }
            : undefined
        }
        onPointerDown={() => startHold("down", activeControls?.onDown)}
        onPointerUp={() => stopHold("down", activeControls?.onDownRelease)}
        onPointerLeave={() => stopHold("down", activeControls?.onDownRelease)}
      >
        <MoveDown size={22} />
      </button>
    </div>
  );
}
