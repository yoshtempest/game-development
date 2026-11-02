import { useCallback, useEffect, useRef } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import type { GameControlLayer } from "@/utils/types/player/controls";
import { useCombatTutorial } from "@/contexts/CombatTutorialContext";

type Dir = Direction;

type Props = {
  activeControls: GameControlLayer;
  pressed: Set<string>;
  onPressDir?: (dir: Dir) => void;
  onReleaseDir?: (dir: Dir) => void;
};

export function JoystickMovement({
  activeControls,
  pressed,
  onPressDir,
  onReleaseDir,
}: Props) {
  const { highlightedControl } = useCombatTutorial();
  const activeDir = useRef<Set<Dir>>(new Set());

  const isDragging = useRef(false);

  const centerRef = useRef<HTMLDivElement | null>(null);

  const innerRef = useRef<HTMLDivElement | null>(null);

  const pressedRef = useLatestRef(pressed);
  const onPressRef = useLatestRef(onPressDir);
  const onReleaseRef = useLatestRef(onReleaseDir);

  function execute(dir: Dir, pressed: boolean) {
    if (pressed) {
      onPressRef.current?.(dir);
      switch (dir) {
        case "up":
          activeControls?.onUp?.();
          break;
        case "down":
          activeControls?.onDown?.();
          break;
        case "left":
          activeControls?.onLeft?.();
          break;
        case "right":
          activeControls?.onRight?.();
          break;
      }
    } else {
      onReleaseRef.current?.(dir);
      switch (dir) {
        case "up":
          activeControls?.onUpRelease?.();
          break;
        case "down":
          activeControls?.onDownRelease?.();
          break;
        case "left":
          activeControls?.onLeftRelease?.();
          break;
        case "right":
          activeControls?.onRightRelease?.();
          break;
      }
    }
  }

  const syncInnerToKeyboard = useCallback(() => {
    if (isDragging.current) return;
    const inner = innerRef.current;
    const el = centerRef.current;
    if (!inner || !el) return;

    const maxRadius = el.offsetWidth / 2 - inner.offsetWidth / 2;
    const p = pressedRef.current;

    let dx = 0;
    let dy = 0;
    if (p.has("left")) dx -= 1;
    if (p.has("right")) dx += 1;
    if (p.has("up")) dy -= 1;
    if (p.has("down")) dy += 1;

    if (dx === 0 && dy === 0) {
      inner.style.transform = "translate(0px, 0px)";
      return;
    }

    const len = Math.sqrt(dx * dx + dy * dy);
    const ratio = maxRadius / len;
    inner.style.transform = `translate(${dx * ratio}px, ${dy * ratio}px)`;
  }, [pressedRef]);

  useEffect(() => {
    syncInnerToKeyboard();
  }, [pressed, syncInnerToKeyboard]);

  function updateDirection(clientX: number, clientY: number) {
    const el = centerRef.current;
    const inner = innerRef.current;

    if (!el || !inner) return;

    const rect = el.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let x = clientX - centerX;
    let y = clientY - centerY;

    const maxRadius = rect.width / 2 - inner.offsetWidth / 2;

    const distance = Math.sqrt(x * x + y * y);

    if (distance > maxRadius) {
      const ratio = maxRadius / distance;

      x *= ratio;
      y *= ratio;
    }

    inner.style.transform = `translate(${x}px, ${y}px)`;

    const deadzone = 15;

    const newDir = new Set<Dir>();

    if (y < -deadzone) newDir.add("up");
    else if (y > deadzone) newDir.add("down");

    if (x < -deadzone) newDir.add("left");
    else if (x > deadzone) newDir.add("right");

    activeDir.current.forEach((dir) => {
      if (!newDir.has(dir)) {
        execute(dir, false);
      }
    });

    newDir.forEach((dir) => {
      if (!activeDir.current.has(dir)) {
        execute(dir, true);
      }
    });

    activeDir.current = new Set(newDir);
  }

  function handleStart(e: React.PointerEvent) {
    isDragging.current = true;

    const el = e.currentTarget as HTMLElement;

    el.setPointerCapture(e.pointerId);

    updateDirection(e.clientX, e.clientY);
  }

  function handleMove(e: React.PointerEvent) {
    if (!isDragging.current) return;

    updateDirection(e.clientX, e.clientY);
  }

  function handleEnd() {
    isDragging.current = false;

    activeDir.current.forEach((dir) => {
      execute(dir, false);
    });

    activeDir.current.clear();

    syncInnerToKeyboard();
  }

  return (
    <div
      ref={centerRef}
      className="dpad"
      style={
        highlightedControl === "up" ||
        highlightedControl === "down" ||
        highlightedControl === "left" ||
        highlightedControl === "right"
          ? { border: "3px solid white" }
          : undefined
      }
      onPointerDown={handleStart}
      onPointerMove={handleMove}
      onPointerUp={handleEnd}
      onPointerCancel={handleEnd}
    >
      <div ref={innerRef} className="inner" />
      <div
        className={`dpadArrow dpadArrowUp ${pressed.has("up") ? "dpadArrowActive" : ""}`}
      />
      <div
        className={`dpadArrow dpadArrowDown ${pressed.has("down") ? "dpadArrowActive" : ""}`}
      />
      <div
        className={`dpadArrow dpadArrowLeft ${pressed.has("left") ? "dpadArrowActive" : ""}`}
      />
      <div
        className={`dpadArrow dpadArrowRight ${pressed.has("right") ? "dpadArrowActive" : ""}`}
      />
    </div>
  );
}
