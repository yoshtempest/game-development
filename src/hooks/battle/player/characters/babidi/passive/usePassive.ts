import type { Props } from "./types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import type { BabidiCloneVisual } from "@/utils/types/character/babidi";
import { babidiSoundPath } from "@/utils/paths/song/characters/babidiPath";

const CLONE_COUNT = 8;
const SPAWN_INTERVAL_MS = 500;
const RUN_STAGGER_MS = 50;
const RUN_DURATION_MS = 600;

export function useBabidiPassive({
  enabled,
  player,
  setPlayer,
  setPlayerHP,
  getPlayerMaxHp,
  getNpc,
  onExplode,
  freezeActionsUntilRef,
}: Props) {
  const usedRef = useRef(false);
  const [active, setActive] = useState(false);
  const [clones, setClones] = useState<BabidiCloneVisual[]>([]);
  const [debuff, setDebuff] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const clearAll = useCallback(() => {
    for (const t of timersRef.current) clearTimeout(t);
    for (const i of intervalsRef.current) clearInterval(i);
    timersRef.current = [];
    intervalsRef.current = [];
  }, []);

  const surviveLethalHitRef = useLatestRef(() => {
    if (!enabled || usedRef.current) return false;
    usedRef.current = true;
    setActive(true);

    const spawnDuration = CLONE_COUNT * SPAWN_INTERVAL_MS;
    freezeActionsUntilRef.current = Math.max(
      freezeActionsUntilRef.current,
      Date.now() + spawnDuration,
    );
    setPlayer((p) => ({ ...p, state: "idle" }));

    // Spawn clones one by one every 200ms, all idle, spaced so they don't overlap.
    const baseX = player.x;
    const baseY = player.y;
    const spawned: BabidiCloneVisual[] = [];

    for (let i = 0; i < CLONE_COUNT; i++) {
      timersRef.current.push(
        setTimeout(() => {
          const audio = new Audio(babidiSoundPath("defeat.mp3").src);
          audio.play().catch(() => {});
          const clone: BabidiCloneVisual = {
            id: `babidi-clone-${Date.now()}-${i}`,
            x: baseX + i * 100,
            y: baseY,
            state: "idle",
            exploded: false,
          };
          spawned.push(clone);
          setClones((prev) => [...prev, clone]);
        }, i * SPAWN_INTERVAL_MS),
      );
    }

    // After all spawned, start sequential run+explosion.
    const runStart = spawnDuration;
    timersRef.current.push(
      setTimeout(() => {
        for (let i = 0; i < CLONE_COUNT; i++) {
          timersRef.current.push(
            setTimeout(() => {
              // We reference clones by index order; find current clone at i.
              setClones((prev) => {
                const clone = prev[i];
                if (!clone) return prev;
                const next = [...prev];
                next[i] = { ...clone, state: "run" };
                return next;
              });

              // Animate this clone toward the nearest enemy (NPC).
              const npc = getNpc();
              const startX = baseX + i * 100;
              const targetX = npc.x;
              const targetY = npc.y;
              const stepMs = 16;
              const steps = Math.ceil(RUN_DURATION_MS / stepMs);
              let step = 0;
              const interval = setInterval(() => {
                step++;
                const t = Math.min(1, step / steps);
                const x = startX + (targetX - startX) * t;
                const y = baseY + (targetY - baseY) * t;
                setClones((prev) => {
                  const clone = prev[i];
                  if (!clone || clone.exploded) return prev;
                  const next = [...prev];
                  next[i] = { ...clone, x, y };
                  return next;
                });
                if (t >= 1) {
                  clearInterval(interval);
                  intervalsRef.current = intervalsRef.current.filter(
                    (iv) => iv !== interval,
                  );
                  // Explode.
                  setClones((prev) => {
                    const clone = prev[i];
                    if (!clone) return prev;
                    const next = [...prev];
                    next[i] = { ...clone, exploded: true };
                    return next;
                  });
                  if (onExplode) onExplode(targetX, targetY);
                }
              }, stepMs);
              intervalsRef.current.push(interval);
            }, runStart + i * RUN_STAGGER_MS),
          );
        }
      }, runStart),
    );

    // Cleanup after all clones exploded.
    const totalDuration =
      spawnDuration + CLONE_COUNT * RUN_STAGGER_MS + RUN_DURATION_MS + 400;
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
        clearAll();
      }, totalDuration),
    );

    return true;
  });

  useEffect(() => {
    return () => clearAll();
  }, [clearAll]);

  return {
    usedRef,
    active,
    clones,
    debuff,
    surviveLethalHitRef,
  };
}