import type { Props, PetState } from "./types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { FOUR_HUNDRED_MS, FIVE_HUNDRED_MS, ONE_THOUSAND_MS } from "@/data/ms";

export type PetJumpAttack = {
  npcX: number;
  npcY: number;
  callback: (damage: number) => void;
};

const OFFSET_X = 60;
const JUMP_DURATION = FOUR_HUNDRED_MS;
const ATTACK_DURATION = FIVE_HUNDRED_MS;
const RETURN_SPEED = 0.06;
const BITE_FRONT_OFFSET = 50;
const BITE_DURATION = ONE_THOUSAND_MS;
const PET_CHARGE_SPEED = 500;
const PET_RETURN_SPEED = 240;
const PET_FOLLOW_SPEED = 120;
const FOLLOW_CUSHION = 90;

export function usePetBattle({
  enabled,
  playerX,
  playerY,
  npcX,
  isPaused,
  spriteNpcType = "goat",
}: Props) {
  const [pet, setPet] = useState<PetState>(null);

  const playerXRef = useLatestRef(playerX);
  const playerYRef = useLatestRef(playerY);
  const npcXRef = useLatestRef(npcX);
  const isPausedRef = useLatestRef(isPaused);

  const jumpAttackRef = useRef<PetJumpAttack | null>(null);
  const jumpPhaseRef = useRef<"idle" | "jumping" | "attacking" | "returning">(
    "idle",
  );
  const jumpStartRef = useRef(0);
  const jumpFromRef = useRef({ x: 0, y: 0 });
  const jumpToRef = useRef({ x: 0, y: 0 });
  const jumpCallbackRef = useRef<((damage: number) => void) | null>(null);

  const bitePhaseRef = useRef<"idle" | "running" | "melee" | "returning">(
    "idle",
  );
  const biteStartRef = useRef(0);
  const biteFromRef = useRef({ x: 0, y: 0 });
  const biteToRef = useRef({ x: 0, y: 0 });
  const biteReturnFromRef = useRef({ x: 0, y: 0 });
  const biteCallbackRef = useRef<((damage: number) => void) | null>(null);
  const invokeUntilRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setPet(null);
      return;
    }

    setPet((prev) => {
      if (prev) return prev;
      return {
        x: playerX - OFFSET_X,
        y: playerY,
        direction: "right",
        state: "idle",
        npcType: spriteNpcType,
      };
    });
  }, [enabled, playerX, playerY, spriteNpcType]);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      if (isPausedRef.current) return;

      const now = Date.now();

      const jp = jumpPhaseRef.current;
      if (jp === "jumping" || jp === "attacking" || jp === "returning") {
        setPet((prev) => {
          if (!prev) return prev;
          const now = Date.now();

          if (jp === "jumping") {
            const elapsed = now - jumpStartRef.current;
            const t = Math.min(elapsed / JUMP_DURATION, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            const x =
              jumpFromRef.current.x +
              (jumpToRef.current.x - jumpFromRef.current.x) * eased;
            const arcHeight = -120 * Math.sin(t * Math.PI);
            const baseY =
              jumpFromRef.current.y +
              (jumpToRef.current.y - jumpFromRef.current.y) * eased;
            const dir: "left" | "right" =
              jumpToRef.current.x > prev.x ? "right" : "left";
            if (t >= 1) {
              jumpPhaseRef.current = "attacking";
              jumpStartRef.current = now;
              jumpCallbackRef.current?.(0);
              jumpCallbackRef.current = null;
              return {
                ...prev,
                x: jumpToRef.current.x,
                y: jumpToRef.current.y,
                direction: dir,
                state: "jumpAttack",
              };
            }
            return {
              ...prev,
              x,
              y: baseY + arcHeight,
              direction: dir,
              state: "jumping",
            };
          }

          if (jp === "attacking") {
            const elapsed = now - jumpStartRef.current;
            if (elapsed >= ATTACK_DURATION) {
              jumpPhaseRef.current = "returning";
              return { ...prev, state: "walk" };
            }
            return { ...prev, state: "jumpAttack" };
          }

          if (jp === "returning") {
            const targetX = playerXRef.current - OFFSET_X;
            const targetY = playerYRef.current;
            const dx = targetX - prev.x;
            const dy = targetY - prev.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 2) {
              jumpPhaseRef.current = "idle";
              jumpAttackRef.current = null;
              return {
                ...prev,
                x: targetX,
                y: targetY,
                direction:
                  npcXRef.current - playerXRef.current > 0 ? "right" : "left",
                state: "idle",
              };
            }
            return {
              ...prev,
              x: prev.x + dx * RETURN_SPEED,
              y: prev.y + dy * RETURN_SPEED,
              direction: dx > 0 ? "right" : "left",
              state: "walk",
            };
          }

          return prev;
        });
        return;
      }

      const bp = bitePhaseRef.current;
      if (bp !== "idle") {
        if (bp === "running") {
          const elapsed = now - biteStartRef.current;
          const dist = Math.hypot(
            biteToRef.current.x - biteFromRef.current.x,
            biteToRef.current.y - biteFromRef.current.y,
          );
          const duration = Math.max(1, (dist / PET_CHARGE_SPEED) * 1000);
          const t = Math.min(elapsed / duration, 1);
          const x =
            biteFromRef.current.x +
            (biteToRef.current.x - biteFromRef.current.x) * t;
          const y =
            biteFromRef.current.y +
            (biteToRef.current.y - biteFromRef.current.y) * t;
          const dir: "left" | "right" =
            biteToRef.current.x > biteFromRef.current.x ? "right" : "left";
          if (t >= 1) {
            bitePhaseRef.current = "melee";
            biteStartRef.current = now;
            biteCallbackRef.current?.(0);
            biteCallbackRef.current = null;
            setPet((prev) =>
              prev
                ? {
                    ...prev,
                    x: biteToRef.current.x,
                    y: biteToRef.current.y,
                    direction: dir,
                    state: "meleeAttack",
                  }
                : prev,
            );
            return;
          }
          setPet((prev) =>
            prev ? { ...prev, x, y, direction: dir, state: "run" } : prev,
          );
          return;
        }

        if (bp === "melee") {
          if (now - biteStartRef.current >= BITE_DURATION) {
            bitePhaseRef.current = "returning";
            biteStartRef.current = now;
            biteReturnFromRef.current = {
              x: biteToRef.current.x,
              y: biteToRef.current.y,
            };
          }
          setPet((prev) => (prev ? { ...prev, state: "meleeAttack" } : prev));
          return;
        }

        if (bp === "returning") {
          const targetX = playerXRef.current - OFFSET_X;
          const targetY = playerYRef.current;
          const elapsed = now - biteStartRef.current;
          const dist = Math.hypot(
            targetX - biteReturnFromRef.current.x,
            targetY - biteReturnFromRef.current.y,
          );
          const duration = Math.max(1, (dist / PET_RETURN_SPEED) * 1000);
          const t = Math.min(elapsed / duration, 1);
          const x =
            biteReturnFromRef.current.x +
            (targetX - biteReturnFromRef.current.x) * t;
          const y =
            biteReturnFromRef.current.y +
            (targetY - biteReturnFromRef.current.y) * t;
          const dir: "left" | "right" =
            targetX > biteReturnFromRef.current.x ? "right" : "left";
          if (t >= 1) {
            bitePhaseRef.current = "idle";
            setPet((prev) =>
              prev
                ? {
                    ...prev,
                    x: targetX,
                    y: targetY,
                    direction:
                      npcXRef.current - playerXRef.current > 0
                        ? "right"
                        : "left",
                    state: "idle",
                  }
                : prev,
            );
            return;
          }
          setPet((prev) =>
            prev ? { ...prev, x, y, direction: dir, state: "run" } : prev,
          );
          return;
        }
      }

      if (now < invokeUntilRef.current) {
        setPet((prev) =>
          prev && prev.state !== "invoking"
            ? { ...prev, state: "invoking" }
            : prev,
        );
        return;
      }

      const targetX = playerXRef.current - OFFSET_X;
      const direction: "left" | "right" =
        npcXRef.current - playerXRef.current > 0 ? "right" : "left";

      setPet((prev) => {
        if (!prev) return prev;
        const dx = targetX - prev.x;
        const dy = playerYRef.current - prev.y;
        const step = PET_FOLLOW_SPEED / 50;
        const near =
          Math.abs(dx) < FOLLOW_CUSHION && Math.abs(dy) < FOLLOW_CUSHION;
        if (near) {
          if (prev.state === "idle" && prev.direction === direction)
            return prev;
          return { ...prev, direction, state: "idle" };
        }
        const dir: "left" | "right" = dx > 0 ? "right" : "left";
        const nextX =
          Math.abs(dx) <= step ? targetX : prev.x + Math.sign(dx) * step;
        const nextY =
          Math.abs(dy) <= step
            ? playerYRef.current
            : prev.y + Math.sign(dy) * step;
        return {
          ...prev,
          x: nextX,
          y: nextY,
          direction: dir,
          state: "walk",
        };
      });
    }, 20);

    return () => clearInterval(interval);
  }, [enabled, isPausedRef, npcXRef, playerXRef, playerYRef]);

  const triggerJumpAttack = useCallback(
    (npcY: number, callback: (damage: number) => void) => {
      if (jumpPhaseRef.current !== "idle") return;
      setPet((prev) => {
        if (!prev) return prev;
        jumpPhaseRef.current = "jumping";
        jumpStartRef.current = Date.now();
        jumpFromRef.current = { x: prev.x, y: prev.y };
        jumpToRef.current = { x: npcXRef.current, y: npcY };
        jumpCallbackRef.current = callback;
        return prev;
      });
    },
    [npcXRef],
  );

  const triggerTeleportBite = useCallback(
    (targetX: number, targetY: number, callback: (damage: number) => void) => {
      if (bitePhaseRef.current !== "idle") return;
      setPet((prev) => {
        if (!prev) return prev;
        const x = targetX - BITE_FRONT_OFFSET;
        const dir: "left" | "right" = targetX > prev.x ? "right" : "left";
        bitePhaseRef.current = "running";
        biteStartRef.current = Date.now();
        biteFromRef.current = { x: prev.x, y: prev.y };
        biteToRef.current = { x, y: targetY };
        biteCallbackRef.current = callback;
        return { ...prev, direction: dir, state: "run" };
      });
    },
    [],
  );

  /**
   * Segura o pet parado no sprite `invoking` por `durationMs` (issue #204:
   * hungryKing invocando o hungryDeath). Pulo e mordida têm prioridade no
   * loop, então a invocação não interrompe um ataque já em curso; quando o
   * prazo vence, o loop de seguir o player devolve o estado para idle/walk.
   */
  const triggerInvoke = useCallback((durationMs: number) => {
    invokeUntilRef.current = Date.now() + durationMs;
    setPet((prev) => (prev ? { ...prev, state: "invoking" } : prev));
  }, []);

  function resetPet() {
    if (!enabled) return;
    invokeUntilRef.current = 0;
    jumpPhaseRef.current = "idle";
    jumpAttackRef.current = null;
    bitePhaseRef.current = "idle";
    biteCallbackRef.current = null;
    setPet({
      x: playerX - OFFSET_X,
      y: playerY,
      direction: "right",
      state: "idle",
      npcType: spriteNpcType,
    });
  }

  return {
    pet,
    setPet,
    resetPet,
    triggerJumpAttack,
    triggerTeleportBite,
    triggerInvoke,
  };
}
