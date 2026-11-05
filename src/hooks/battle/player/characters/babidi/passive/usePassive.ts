import type { Props } from "./types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import type { BabidiCloneVisual } from "@/utils/types/character/babidi";

export function useBabidiPassive({
  enabled,
  player,
  setPlayer,
  setPlayerHP,
  getPlayerMaxHp,
  getNpc,
  playSound,
  freezeActionsUntilRef,
}: Props) {
  const usedRef = useRef(false);
  const [active, setActive] = useState(false);
  const [clones, setClones] = useState<BabidiCloneVisual[]>([]);
  const [debuff, setDebuff] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];
  }, []);

  const surviveLethalHitRef = useLatestRef(() => {
    if (!enabled || usedRef.current) return false;
    usedRef.current = true;
    setActive(true);
    freezeActionsUntilRef.current = Math.max(
      freezeActionsUntilRef.current,
      Date.now() + 2500,
    );
    setPlayer((p) => ({ ...p, state: "idle" }));

    const count = 8;
    const newClones: BabidiCloneVisual[] = Array.from(
      { length: count },
      (_, i) => ({
        id: `babidi-clone-${Date.now()}-${i}`,
        x: player.x + (i % 4) * 12 - 18,
        y: player.y,
        state: "idle",
        exploded: false,
      }),
    );
    setClones(newClones);

    newClones.forEach((clone, i) => {
      timersRef.current.push(
        setTimeout(() => {
          playSound("defeat");
          setClones((prev) =>
            prev.map((c) =>
              c.id === clone.id ? { ...c, state: "run" } : c,
            ),
          );
        }, i * 50),
      );
      timersRef.current.push(
        setTimeout(() => {
          setClones((prev) =>
            prev.map((c) =>
              c.id === clone.id
                ? { ...c, x: getNpc().x, y: getNpc().y, exploded: true }
                : c,
            ),
          );
        }, 700 + i * 50),
      );
    });

    timersRef.current.push(
      setTimeout(() => {
        setClones([]);
        setActive(false);
        setDebuff(true);
        if (setPlayerHP && getPlayerMaxHp) {
          const maxHp = getPlayerMaxHp();
          setPlayerHP(Math.max(1, Math.floor(maxHp * 0.5)));
        }
        freezeActionsUntilRef.current = Date.now();
        clearTimers();
      }, 2500),
    );

    return true;
  });

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return {
    usedRef,
    active,
    clones,
    debuff,
    surviveLethalHitRef,
  };
}