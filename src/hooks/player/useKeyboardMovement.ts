import { useCallback, useEffect, useRef, useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useNavbar } from "@/contexts/NavbarContext";
import { useGameControls } from "@/contexts/GameControlsContext";
import { isMovementLocked } from "@/gameRules/movement/state";
import { isPlayerRestrained } from "@/gameRules/battle/playerStates";
import { useCharacterProgress } from "@/contexts/CharacterProgressContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useDashDetection } from "./useDashDetection";

type Dir = "up" | "down" | "left" | "right";

export function useKeyboardMovement() {
  const {
    player,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    moveUpBattle,
    toggleCrouch,
    startMoveLeft,
    stopMoveLeft,
    startMoveRight,
    stopMoveRight,
    startMoveUpExplore,
    stopMoveUpExplore,
    startMoveDownExplore,
    stopMoveDownExplore,
    startMoveLeftExplore,
    stopMoveLeftExplore,
    startMoveRightExplore,
    stopMoveRightExplore,
    dash,
  } = usePlayer();

  const { isNavOpen } = useNavbar();
  const { activeControls, pushControls } = useGameControls();

  const isLocked = isMovementLocked(player.mode, isNavOpen);
  const isBattle = player.mode === "battle";

  const [mode, setMode] = useState<"joystick" | "buttons">("joystick");
  const [pressed, setPressed] = useState<Set<Dir>>(new Set());

  const press = useCallback((dir: Dir) => {
    setPressed((prev) => {
      if (prev.has(dir)) return prev;
      return new Set(prev).add(dir);
    });
  }, []);

  const release = useCallback((dir: Dir) => {
    setPressed((prev) => {
      if (!prev.has(dir)) return prev;
      const next = new Set(prev);
      next.delete(dir);
      return next;
    });
  }, []);

  const isLockedRef = useLatestRef(isLocked);
  const isBattleRef = useLatestRef(isBattle);

  const moveUpRef = useLatestRef(moveUp);
  const moveDownRef = useLatestRef(moveDown);
  const moveLeftRef = useLatestRef(moveLeft);
  const moveRightRef = useLatestRef(moveRight);

  const moveUpBattleRef = useLatestRef(moveUpBattle);
  const toggleCrouchRef = useLatestRef(toggleCrouch);

  const startMoveLeftRef = useLatestRef(startMoveLeft);
  const stopMoveLeftRef = useLatestRef(stopMoveLeft);
  const startMoveRightRef = useLatestRef(startMoveRight);
  const stopMoveRightRef = useLatestRef(stopMoveRight);
  const startMoveUpExploreRef = useLatestRef(startMoveUpExplore);
  const stopMoveUpExploreRef = useLatestRef(stopMoveUpExplore);
  const startMoveDownExploreRef = useLatestRef(startMoveDownExplore);
  const stopMoveDownExploreRef = useLatestRef(stopMoveDownExplore);
  const startMoveLeftExploreRef = useLatestRef(startMoveLeftExplore);
  const stopMoveLeftExploreRef = useLatestRef(stopMoveLeftExplore);
  const startMoveRightExploreRef = useLatestRef(startMoveRightExplore);
  const stopMoveRightExploreRef = useLatestRef(stopMoveRightExplore);

  const { progress } = useCharacterProgress();
  const progressRef = useLatestRef(progress);
  const playerRef = useLatestRef(player);

  const dashRef = useLatestRef(dash);
  const lastLeftPressRef = useRef(0);
  const lastRightPressRef = useRef(0);
  const lastDashTimeRef = useRef(0);
  const isUpHeldRef = useRef(false);
  const isDownHeldRef = useRef(false);
  const isLeftHeldRef = useRef(false);
  const isRightHeldRef = useRef(false);

  useEffect(() => {
    if (!isLocked) return;

    isUpHeldRef.current = false;
    isDownHeldRef.current = false;
    isLeftHeldRef.current = false;
    isRightHeldRef.current = false;

    stopMoveUpExploreRef.current();
    stopMoveDownExploreRef.current();
    stopMoveLeftExploreRef.current();
    stopMoveRightExploreRef.current();

    setPressed(new Set());
  }, [
    isLocked,
    stopMoveDownExploreRef,
    stopMoveLeftExploreRef,
    stopMoveRightExploreRef,
    stopMoveUpExploreRef,
  ]);

  const pushControlsRef = useLatestRef(pushControls);

  const pressRef = useLatestRef(press);
  const releaseRef = useLatestRef(release);

  const dashRefs = {
    progressRef,
    playerRef,
    dashRef,
    lastLeftPressRef,
    lastRightPressRef,
    lastDashTimeRef,
  };
  const { tryDashRef } = useDashDetection(dashRefs);

  useEffect(() => {
    const DIR_KEYS: Record<string, Dir> = {
      ArrowUp: "up",
      w: "up",
      W: "up",
      ArrowDown: "down",
      s: "down",
      S: "down",
      ArrowLeft: "left",
      a: "left",
      A: "left",
      ArrowRight: "right",
      d: "right",
      D: "right",
    };

    function onKeyDown(e: KeyboardEvent) {
      const dir = DIR_KEYS[e.key];
      if (dir) pressRef.current(dir);
    }

    function onKeyUp(e: KeyboardEvent) {
      const dir = DIR_KEYS[e.key];
      if (dir) releaseRef.current(dir);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [pressRef, releaseRef]);

  const isGrabbed = () => isPlayerRestrained(playerRef.current);

  useEffect(() => {
    const controls = {
      onUp: () => {
        if (isLockedRef.current) return;
        if (isGrabbed()) return;
        if (isUpHeldRef.current) {
          if (isBattleRef.current) moveUpBattleRef.current();
          // Explore: não move imediatamente no repeat do keydown — o intervalo
          // (300ms) já cuida dos passos subsequentes para não andar rápido demais.
          return;
        }
        isUpHeldRef.current = true;
        if (isBattleRef.current) moveUpBattleRef.current();
        else {
          moveUpRef.current();
          startMoveUpExploreRef.current();
        }
      },
      onUpRelease: () => {
        isUpHeldRef.current = false;
        stopMoveUpExploreRef.current();
      },

      onDown: () => {
        if (isLockedRef.current) return;
        if (isGrabbed()) return;
        if (isDownHeldRef.current) {
          if (isBattleRef.current) toggleCrouchRef.current();
          // Explore: não move imediatamente no repeat do keydown.
          return;
        }
        isDownHeldRef.current = true;
        if (isBattleRef.current) toggleCrouchRef.current();
        else {
          moveDownRef.current();
          startMoveDownExploreRef.current();
        }
      },
      onDownRelease: () => {
        isDownHeldRef.current = false;
        stopMoveDownExploreRef.current();
      },

      onLeft: () => {
        if (isLockedRef.current) return;
        if (isGrabbed()) return;
        if (isLeftHeldRef.current) {
          if (isBattleRef.current) startMoveLeftRef.current();
          // Explore: não move imediatamente no repeat do keydown.
          return;
        }
        isLeftHeldRef.current = true;
        if (isBattleRef.current) {
          tryDashRef.current("left", startMoveLeftRef);
        } else {
          moveLeftRef.current();
          startMoveLeftExploreRef.current();
        }
      },
      onLeftRelease: () => {
        isLeftHeldRef.current = false;
        stopMoveLeftRef.current();
        stopMoveLeftExploreRef.current();
      },

      onRight: () => {
        if (isLockedRef.current) return;
        if (isGrabbed()) return;
        if (isRightHeldRef.current) {
          if (isBattleRef.current) startMoveRightRef.current();
          // Explore: não move imediatamente no repeat do keydown.
          return;
        }
        isRightHeldRef.current = true;
        if (isBattleRef.current) {
          tryDashRef.current("right", startMoveRightRef);
        } else {
          moveRightRef.current();
          startMoveRightExploreRef.current();
        }
      },
      onRightRelease: () => {
        isRightHeldRef.current = false;
        stopMoveRightRef.current();
        stopMoveRightExploreRef.current();
      },
    };

    const remove = pushControlsRef.current(controls);
    const stopMoveUpExplore = stopMoveUpExploreRef.current;
    const stopMoveDownExplore = stopMoveDownExploreRef.current;
    const stopMoveLeftExplore = stopMoveLeftExploreRef.current;
    const stopMoveRightExplore = stopMoveRightExploreRef.current;
    return () => {
      isUpHeldRef.current = false;
      isDownHeldRef.current = false;
      isLeftHeldRef.current = false;
      isRightHeldRef.current = false;
      stopMoveUpExplore();
      stopMoveDownExplore();
      stopMoveLeftExplore();
      stopMoveRightExplore();
      remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    pressed,
    mode,
    setMode,
    activeControls,
    press,
    release,
  };
}
