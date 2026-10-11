import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useGameControls } from "@/contexts/GameControlsContext";
import { BATTLE_LIMITS } from "@/gameRules/movement/constants";
import {
  getGroundAtX,
  isHorizontallyBlocked,
} from "@/gameRules/battle/obstacles";
import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { SoundId } from "@/utils/audio/soundId";
import type { BattleObstacle } from "@/utils/types/maps/battle";
import type { EmanuelCloneVisual } from "@/utils/types/character/emanuel";
import {
  EMANUEL_CLONE_COLLISION_H,
  EMANUEL_CLONE_COLLISION_W,
  EMANUEL_CLONE_KI_PER_PIXEL,
  EMANUEL_CLONE_MAX_COST,
  EMANUEL_CLONE_MIN_KI,
  EMANUEL_CLONE_MOVE_PX,
  EMANUEL_CLONE_MOVE_TICK_MS,
  EMANUEL_CLONE_TIME_SCALE,
} from "@/data/characters/emanuel/emanuel";
import { useSkillGuard } from "@/hooks/battle/player/characters/useSkillGuard";

type Props = {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  battleManaRef: RefObject<BattleManaApi | null>;
  obstacles?: BattleObstacle[];
  freezeActionsUntilRef: RefObject<number>;
  setTimeScale: (scale: number) => void;
  resetTimeScale: () => void;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  /** Chamado quando o press inicia a instância (carga da Expansão de Domínio). */
  onUsed?: () => void;
  isPausedRef: RefObject<boolean>;
  /** true quando os controles gerais de batalha estão desabilitados (pause, transição de fase, throw). */
  disabledRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
};

/**
 * Instância do Emanuel: segurar o botão cria uma segunda cópia em silhueta que
 * acompanha o joystick com ~2x a velocidade, sem gravidade, colidindo com o
 * terreno (NPCs/entidades ignoram a cópia). O tempo da batalha cai para 0.5x e
 * o jogador fica congelado (nenhuma outra ação é possível). Ao soltar, o
 * jogador teleporta para a posição da instância, que desaparece, pagando até
 * 50 de Ki proporcional à distância.
 */
export function useEmanuelClone({
  player,
  setPlayer,
  battleManaRef,
  obstacles,
  freezeActionsUntilRef,
  setTimeScale,
  resetTimeScale,
  playSound,
  onUsed,
  isPausedRef,
  disabledRef,
  battleEndedRef,
}: Props) {
  const { pushControls } = useGameControls();

  const [cloneVisual, setCloneVisual] = useState<EmanuelCloneVisual | null>(
    null,
  );

  const activeRef = useRef(false);
  const startXRef = useRef(player.x);
  const startYRef = useRef(player.y);
  const xRef = useRef(player.x);
  const yRef = useRef(player.y);
  const dirRef = useRef<Direction>(player.battleDirection);
  const leftRef = useRef(false);
  const rightRef = useRef(false);
  const upRef = useRef(false);
  const downRef = useRef(false);
  const removeLayerRef = useRef<(() => void) | null>(null);

  const pushControlsRef = useLatestRef(pushControls);
  const onUsedRef = useLatestRef(onUsed);
  const obstaclesRef = useLatestRef(obstacles ?? []);
  const playerRef = useLatestRef(player);
  const playSoundRef = useLatestRef(playSound);
  const setTimeScaleRef = useLatestRef(setTimeScale);
  const resetTimeScaleRef = useLatestRef(resetTimeScale);
  const setPlayerRef = useLatestRef(setPlayer);

  const { usableRef: canUseRef, shouldCancelRef } = useSkillGuard({
    player,
    character: "emanuel",
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
    extraUsable: () =>
      (battleManaRef.current?.playerMana ?? 0) >= EMANUEL_CLONE_MIN_KI,
  });

  const cancel = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    leftRef.current = false;
    rightRef.current = false;
    upRef.current = false;
    downRef.current = false;
    removeLayerRef.current?.();
    removeLayerRef.current = null;
    freezeActionsUntilRef.current = Date.now();
    resetTimeScaleRef.current();
    setCloneVisual(null);
  }, [freezeActionsUntilRef, resetTimeScaleRef]);

  const cancelRef = useLatestRef(cancel);

  const release = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    leftRef.current = false;
    rightRef.current = false;
    upRef.current = false;
    downRef.current = false;
    removeLayerRef.current?.();
    removeLayerRef.current = null;

    freezeActionsUntilRef.current = Date.now();
    resetTimeScaleRef.current();

    const mana = battleManaRef.current;
    const distance = Math.hypot(
      xRef.current - startXRef.current,
      yRef.current - startYRef.current,
    );
    const cost = Math.min(
      EMANUEL_CLONE_MAX_COST,
      Math.ceil(distance * EMANUEL_CLONE_KI_PER_PIXEL),
    );
    if (mana) mana.consumeMana(cost);

    const cloneX = xRef.current;
    const cloneY = yRef.current;
    const obstacles = obstaclesRef.current;
    const ground = getGroundAtX(cloneY + 2, cloneX, obstacles);

    setPlayerRef.current((p) => {
      if (p.mode !== "battle") return p;
      return {
        ...p,
        x: cloneX,
        y: ground,
        groundY: ground,
        velY: 0,
        state: "idle",
        battleDirection: dirRef.current,
      };
    });

    playSoundRef.current("emanuelTeleport");
    setCloneVisual(null);
  }, [
    battleManaRef,
    freezeActionsUntilRef,
    obstaclesRef,
    playSoundRef,
    resetTimeScaleRef,
    setPlayerRef,
  ]);

  const press = useCallback(() => {
    if (activeRef.current) return;
    if (!canUseRef.current) return;

    onUsedRef.current?.();
    activeRef.current = true;
    const current = playerRef.current;
    xRef.current = current.x;
    yRef.current = current.y;
    startXRef.current = current.x;
    startYRef.current = current.y;
    dirRef.current = current.battleDirection;

    leftRef.current = false;
    rightRef.current = false;
    upRef.current = false;
    downRef.current = false;

    freezeActionsUntilRef.current = Infinity;
    setTimeScaleRef.current(EMANUEL_CLONE_TIME_SCALE);
    setCloneVisual({
      x: current.x,
      y: current.y,
      direction: current.battleDirection,
    });

    const layer = {
      onConfirm: () => true,
      onCancel: () => true,
      onOpen: () => true,
      onUp: () => {
        upRef.current = true;
        return true;
      },
      onDown: () => {
        downRef.current = true;
        return true;
      },
      onLeft: () => {
        leftRef.current = true;
        return true;
      },
      onRight: () => {
        rightRef.current = true;
        return true;
      },
      onUpRelease: () => {
        upRef.current = false;
      },
      onDownRelease: () => {
        downRef.current = false;
      },
      onLeftRelease: () => {
        leftRef.current = false;
      },
      onRightRelease: () => {
        rightRef.current = false;
      },
      onConfirmRelease: () => {},
      onCancelRelease: () => {},
    };

    removeLayerRef.current = pushControlsRef.current(layer);
    playSoundRef.current("blink");
  }, [
    canUseRef,
    freezeActionsUntilRef,
    onUsedRef,
    playSoundRef,
    playerRef,
    pushControlsRef,
    setTimeScaleRef,
  ]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!activeRef.current) return;

      if (shouldCancelRef.current()) {
        cancelRef.current();
        return;
      }

      let dx = 0;
      let dy = 0;
      if (leftRef.current) dx -= 1;
      if (rightRef.current) dx += 1;
      if (upRef.current) dy -= 1;
      if (downRef.current) dy += 1;
      if (dx === 0 && dy === 0) return;

      const len = Math.hypot(dx, dy);
      const stepX = (dx / len) * EMANUEL_CLONE_MOVE_PX;
      const stepY = (dy / len) * EMANUEL_CLONE_MOVE_PX;

      const obstacles = obstaclesRef.current;
      const nx = Math.max(
        BATTLE_LIMITS.minX,
        Math.min(BATTLE_LIMITS.maxX, xRef.current + stepX),
      );
      const ground = getGroundAtX(yRef.current + 2, nx, obstacles);
      const ny = Math.max(0, Math.min(ground, yRef.current + stepY));

      const left = nx - EMANUEL_CLONE_COLLISION_W / 2;
      const right = nx + EMANUEL_CLONE_COLLISION_W / 2;
      const top = ny - EMANUEL_CLONE_COLLISION_H;
      if (isHorizontallyBlocked(left, top, right, ny, obstacles)) return;

      if (dx !== 0) dirRef.current = dx > 0 ? "right" : "left";
      xRef.current = nx;
      yRef.current = ny;
      setCloneVisual({ x: nx, y: ny, direction: dirRef.current });
    }, EMANUEL_CLONE_MOVE_TICK_MS);

    return () => clearInterval(id);
  }, [cancelRef, obstaclesRef, setCloneVisual, shouldCancelRef]);

  useEffect(() => {
    const cancel = cancelRef.current;
    return () => {
      if (activeRef.current) cancel();
    };
  }, [cancelRef]);

  return {
    cloneVisual,
    press,
    release,
    canUse: canUseRef.current,
  };
}
