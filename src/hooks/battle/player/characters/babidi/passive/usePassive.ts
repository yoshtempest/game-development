import type { Props } from "./types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { ONE_THOUSAND_MS, FIVE_HUNDRED_MS, ONE_HUNDRED_MS } from "@/data/ms";
import type { BabidiCloneVisual } from "@/utils/types/character/babidi";
import { babidiSoundPath } from "@/utils/paths/song/characters/babidiPath";

const CLONE_COUNT = 8;
const SPAWN_INTERVAL_MS = FIVE_HUNDRED_MS;
const RUN_STAGGER_MS = ONE_HUNDRED_MS;
const RUN_DURATION_MS = ONE_THOUSAND_MS;

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
  const cloneIdsRef = useRef<string[]>([]);
  const clonePositionsRef = useRef<Record<string, { x: number; y: number }>>({});

  const clearAll = useCallback(() => {
    console.log("babidi passive clearAll called");
    for (const t of timersRef.current) clearTimeout(t);
    for (const i of intervalsRef.current) clearInterval(i);
    timersRef.current = [];
    intervalsRef.current = [];
    cloneIdsRef.current = [];
    clonePositionsRef.current = {};
  }, []);

  const reset = useCallback(() => {
    usedRef.current = false;
    setActive(false);
    setClones([]);
    setDebuff(false);
    clearAll();
  }, [clearAll]);

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
            x: baseX + i * 60,
            y: baseY,
            state: "idle",
            exploded: false,
            flipped: (getNpc().x ?? 0) < baseX + i * 60,
          };
          spawned.push(clone);
          cloneIdsRef.current.push(clone.id);
          clonePositionsRef.current[clone.id] = { x: clone.x, y: clone.y };
          setClones((prev) => [...prev, clone]);
        }, i * SPAWN_INTERVAL_MS),
      );
    }

    // After all spawned, start sequential run+explosion.
    const runStart = spawnDuration;
    console.log("babidi passive runStart scheduled at", runStart);
    timersRef.current.push(
      setTimeout(() => {
        const npcForSort = getNpc();
        const sortedCloneIds = [...cloneIdsRef.current].sort((a, b) => {
          const pa = clonePositionsRef.current[a] ?? { x: 0, y: 0 };
          const pb = clonePositionsRef.current[b] ?? { x: 0, y: 0 };
          return Math.abs(pa.x - npcForSort.x) - Math.abs(pb.x - npcForSort.x);
        });
        sortedCloneIds.forEach((cloneId, index) => {
          timersRef.current.push(
            setTimeout(() => {
              console.log("babidi passive run clone", cloneId);
              // Animate this clone toward the nearest enemy (NPC).
              const npc = getNpc();
              const startPos = clonePositionsRef.current[cloneId] ?? {
                x: baseX + index * 20,
                y: baseY,
              };
              const startX = startPos.x;
              const startY = startPos.y;
              const targetX = npc.x;
              const targetY = npc.y;

              // Set state to run by id.
              setClones((prev) => {
                const idx = prev.findIndex((c) => c.id === cloneId);
                if (idx === -1) return prev;
                const clone = prev[idx];
                if (!clone) return prev;
                const next = [...prev];
                next[idx] = { ...clone, state: "run", flipped: targetX < startX };
                return next;
              });
              const stepMs = 16;
              const steps = Math.ceil(RUN_DURATION_MS / stepMs);
              let step = 0;
              const interval = setInterval(() => {
                step++;
                const t = Math.min(1, step / steps);
                const x = startX + (targetX - startX) * t;
                const y = startY + (targetY - startY) * t;
                setClones((prev) => {
                  const idx = prev.findIndex((c) => c.id === cloneId);
                  if (idx === -1) return prev;
                  const clone = prev[idx];
                  if (!clone || clone.exploded) return prev;
                  const next = [...prev];
                  next[idx] = { ...clone, x, y };
                  return next;
                });
                if (t >= 1) {
                  clearInterval(interval);
                  intervalsRef.current = intervalsRef.current.filter(
                    (iv) => iv !== interval,
                  );
                  // Explode.
                  setClones((prev) => {
                    const idx = prev.findIndex((c) => c.id === cloneId);
                    if (idx === -1) return prev;
                    const clone = prev[idx];
                    if (!clone) return prev;
                    const next = [...prev];
                    next[idx] = { ...clone, exploded: true };
                    return next;
                  });
                  if (onExplode) onExplode(targetX, targetY);
                }
              }, stepMs);
              intervalsRef.current.push(interval);
            }, index * RUN_STAGGER_MS),
          );
        });
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
    reset,
  };
}